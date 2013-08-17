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

  var savedBrowsers = [];
  var allMessages = [];

  baseReporterDecorator(this);

  this.adapters = [function (msg) {
    allMessages.push(msg);
  }];


  client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
  });

  function sendData(objectToSend) {
    if (connection.connected) {
      connection.sendUTF(JSON.stringify(objectToSend));
    } else {
      log.error("Failed to use connection")
    }
  }

  function getCurrentTimestamp() {
    return (new Date()).toISOString().substr(0, 19);
  }

  this.onRunStart = function (browsers) {

    log.info('WebSocket client connected');
    connection.on('error', function (error) {
      log.info("Connection Error: " + error.toString());
    });

    connection.on('close', function () {
      log.info(' Connection Closed');
    });

    var timestamp = getCurrentTimestamp();

    browsers.forEach(function (browser) {
      savedBrowsers.push({
        name: browser.name, timestamp: timestamp, browserId: browser.id, hostname: os.hostname()
      });
      log.info("onRunStart: " + savedBrowsers[browser.id]);
    });

    sendData({ "type": "browsers", "list": savedBrowsers});
  };

  this.onBrowserComplete = function (browser) {
    sendData({ "type": "browserComplete", 'browserId': browser.id, 'timestamp': getCurrentTimestamp()});
    log.info("onBrowserComplete: " + browser);
  };

  this.onRunComplete = function () {
    sendData({ 'type': 'runComplete' });
    log.info("onRunComplete ")
  };


  this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
    sendData({'type': 'test', 'result': result, 'browserId': browser.id });
    log.info("specSuccess")
  };

  this.onExit = function (done) {
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
