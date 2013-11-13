var os = require('os');
var WebSocketClient = require('websocket').client;


var RemoteReporter = function (baseReporterDecorator, config, emitter, logger, helper, formatError) {
  var log = logger.create('reporter.remote');
  var host = config.host || "localhost";
  var port = config.port || 9889;
  var finishDelay = config.finishDelay || 1000;

  var clientUrl = "ws://" + host + ":" + port;

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


  client.on('connectFailed', function () {
    log.info('No connection to remote server ("'+clientUrl+'") to report test results');
  });

  function sendData(objectToSend) {
    if (connection && connection.connected) {
      connection.sendUTF(JSON.stringify(objectToSend));
    }
  }

  function getCurrentTimestamp() {
    return (new Date()).toISOString().substr(0, 19);
  }

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
        log.info("onRunStart: " + savedBrowsers[browser.id]);
      });

      sendData({ "type": "browsers", "list": savedBrowsers});
    }
  };

  this.onBrowserComplete = function (browser) {
    sendData({ "type": "browserComplete", 'browserId': browser.id, 'timestamp': getCurrentTimestamp()});
  };

  this.onRunComplete = function () {
    sendData({ 'type': 'runComplete' });
  };

  this.onBrowserError = function(browser, error) {
    sendData({ 'type': 'browserError', 'browserId': browser.id, 'error': error});
  };


  this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
    sendData({'type': 'test', 'result': result, 'browserId': browser.id });
  };

  this.onExit = function (done) {
    setTimeout(function(){
      done();
    },finishDelay);
  };

};

RemoteReporter.$inject = ['baseReporterDecorator', 'config.remoteReporter', 'emitter', 'logger',
  'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:remote': ['type', RemoteReporter]
};
