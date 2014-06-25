(function () {

    "use strict";
    var os = require('os');
    var WebSocketClient = require('websocket').client;

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

        var clientUrl = "ws://" + host + ":" + port;
        var connection;

        var savedBrowsers = [];
        var allMessages = [];

        var client = new WebSocketClient();
        var errorHandlerRegistered = false;

        client.connect(clientUrl, 'karma-test-results'); // TODO: wait until connected, because the reporter could be called by karma before the connection process finished


        client.on('connect', function (con) {
            connection = con;
        });

        client.on('connectFailed', function () {
            log.info('No connection to remote server ("' + clientUrl + '") to report test results');
        });

        baseReporterDecorator(this);

        function sendData(objectToSend) {
            if (connection && connection.connected) {
                connection.sendUTF(JSON.stringify(objectToSend));
            }
        }

        this.adapters = [function (msg) {
            allMessages.push(msg);
        }];

        this.onRunStart = function (browsers) {

            if (connection && connection.connected) {
                connection.on('error', function (error) {
                    log.error("Connection Error: " + error.toString());
                });

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
            if (connection && connection.connected) {
              if (!errorHandlerRegistered){
                connection.on('error', function (error) {
                    log.error("Connection Error: " + error.toString());
                });
                errorHandlerRegistered = true;
              }
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
            setTimeout(function () {
                done();
            }, finishDelay);
        };

    };

    RemoteReporter.$inject = ['baseReporterDecorator', 'config.remoteReporter', 'emitter', 'logger',
        'helper', 'formatError'];

// PUBLISH DI MODULE
    module.exports = {
        'reporter:remote': ['type', RemoteReporter]
    };

})();