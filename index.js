var os = require('os');
var WebSocketClient = require('websocket').client;


var RemoteReporter = function (baseReporterDecorator, config, emitter, logger, helper, formatError) {
    var log = logger.create('reporter.remote');
    var clientUrl = "ws://" + config.host + ":" + config.port;

    var client = new WebSocketClient();
    client.connect(clientUrl, 'karma-test-results'); // TODO: wait until connected, because the reporter could be called by karma before the connection process finished

    var connection;

    client.on('connect', function (con) {
        connection = con;
    });

    var browsers2 = {};
    var allMessages = [];

    baseReporterDecorator(this);

    this.adapters = [function (msg) {
        allMessages.push(msg);
    }];


    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });


    this.onRunStart = function (browsers) {

        log.info('WebSocket client connected');
            connection.on('error', function (error) {
                log.info("Connection Error: " + error.toString());
            });
            connection.on('close', function () {
                log.info(' Connection Closed');
            });


            var timestamp = (new Date()).toISOString().substr(0, 19);

            browsers.forEach(function (browser) {
                browsers2[browser.id] = {
                    name: browser.name, timestamp: timestamp, id: 0, hostname: os.hostname()
                };


                log.info("onRunStart: " + browsers2[browser.id]);
            });

            if (connection.connected) {
                connection.sendUTF(JSON.stringify(browsers2));
            } else {
                log.error("specSucces failed to use connection")
            }
    };

    this.onBrowserComplete = function (browser) {
            if (connection.connected) {
                connection.sendUTF(JSON.stringify({'browserComplete': browser.id}));
            } else {
                log.error("specSucces failed to use connection")
            }
        log.info("onBrowserComplete: " + browser)
    };

    this.onRunComplete = function () {
            if (connection.connected) {
                connection.sendUTF(JSON.stringify({'runComplete': true}));
            } else {
                log.error("specSucces failed to use connection")
            }
        log.info("onRunComplete ")
    };


    this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
            if (connection.connected) {
                log.info("specSucces will be send to client")
                connection.sendUTF(JSON.stringify({'specResult': JSON.stringify(result)}));
            } else {
                log.error("specSucces failed to use connection")
            }
        log.info("specSuccess")
    };

    this.onExit =  function (done) {
        log.info("onExit");
        done();
    };

};

RemoteReporter.$inject = ['baseReporterDecorator', 'config.remoteReporter', 'emitter', 'logger',
    'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:remote': ['type', RemoteReporter]
};
