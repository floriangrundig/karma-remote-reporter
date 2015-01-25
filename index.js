(function () {

    "use strict";
    var os = require('os');
    var net = require('net');

    function getRemoteReporterPort(config){
        var port =  config.port || 9889;
        var remoteReporterPortArgumentName = '--remoteReporterPort';
        // overwrite port if given as a command line argument
        process.argv.forEach(function (val, index, array) {
            var remoteReporterArgument;
            if (val.substring(0, remoteReporterPortArgumentName.length) === remoteReporterPortArgumentName) {
                remoteReporterArgument = val.split('=');
                if (remoteReporterArgument.length === 2) {
                    remoteReporterArgument = remoteReporterArgument[1].replace(/^\s+|\s+$/g, '');
                    if (remoteReporterArgument) {
                        remoteReporterArgument = parseInt(remoteReporterArgument);
                    }
                    if (remoteReporterArgument) {
                        port = remoteReporterArgument;
                    }
                }
            }
        });
        return port;
    }



    function getCurrentTimestamp() {
        return (new Date()).toISOString().substr(0, 19);
    }

    var RemoteReporter = function (baseReporterDecorator, config, emitter, logger, helper, formatError) {
        var log = logger.create('reporter.remote');

        var host = config.host || "localhost";
        var finishDelay = config.finishDelay || 1000;
        var port = getRemoteReporterPort(config);

        var connected = false;

        var savedBrowsers = [];
        var allMessages = [];

        var socket = new net.Socket();
        socket.connect(port, host);
        socket.setEncoding('utf8');


        socket.on('connect', function () {
            log.info('Connected to ' + host + ':' + port);
            connected = true;
        });

        socket.on('error', function (err) {
            log.info('Error while communicate to remote server ("' + host + ':' + port + '") to report test results. \n' + err);
        });

        // Add a 'close' event handler for the client socket
        socket.on('close', function() {
            log.info('Connection closed');
            socket.destroy();
            connected = false;
        });
        baseReporterDecorator(this);

        function sendData(objectToSend) {
            if (connected) {
                socket.write(JSON.stringify(objectToSend)+"\n");
            } else {
                log.error("Not connected to server.")
            }
        }

        this.onRunStart = function (browsers) {

            if (connected) {

                var timestamp = getCurrentTimestamp();

                browsers.forEach(function (browser) {
                    savedBrowsers.push({
                        name: browser.name, timestamp: timestamp, browserId: browser.id, hostname: os.hostname()
                    });
                    log.info("onRunStart: " + browser.id);
                });

                sendData({ "type": "browsers", "list": savedBrowsers});
            }
        };

        this.onBrowserStart = function(browser){
            if (connected) {
                var timestamp = getCurrentTimestamp();

                log.info('browser + connection' + browser.name);
                savedBrowsers.push({
                    name: browser.name, timestamp: timestamp, browserId: browser.id, hostname: os.hostname()
                });
                log.info("onBrowserStart: " + browser.id);

                sendData({ "type": "browsers", "list": savedBrowsers});
            }
        };

        this.onBrowserComplete = function (browser) {
            sendData({ "type": "browserComplete", 'browserId': browser.id, 'timestamp': getCurrentTimestamp()});
        };

        this.onRunComplete = function () {
            sendData({ 'type': 'runComplete' });
        };

        this.onBrowserError = function (browser, error) {
            sendData({ 'type': 'browserError', 'browserId': browser.id, 'error': error});
        };


        this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
            sendData({'type': 'test', 'result': result, 'browserId': browser.id });
        };

        this.onExit = function (done) {
            socket.write("done\n",function() {
                socket.destroy();
                setTimeout(function () {
                    done();
                    log.info('Karma finished...');
                }, finishDelay);
            });

        };

    };

    RemoteReporter.$inject = ['baseReporterDecorator', 'config.remoteReporter', 'emitter', 'logger',
        'helper', 'formatError'];

// PUBLISH DI MODULE
    module.exports = {
        'reporter:remote': ['type', RemoteReporter]
    };

})();