'use strict';
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({host: '127.0.0.1', port: 9000});

var Browser = function (browserId, browserType, startTime) {
  var stopTime;

  return {
    getId: function () { return browserId; },
    setStopTime: function (timestamp) { stopTime = timestamp; }
  };
};

var Test = function (description, suite, wasSuccessful, wasSkipped, duration, browser) {
  function toString() {
    console.log(description +" WAS " + (wasSuccessful)? "": "NOT " + "SUCCESSFUL");
  }

  return {
    toString: toString
  };
};


wss.on('connection', function (ws) {

  var testBrowsers = [];

  function getBrowserById(id) {
    var byBrowserId = function (browser) { return browser.getId() == id; };
    return testBrowsers.filter(byBrowserId)[0];
  }

  function handleMessage(jsonMessage) {
    var result, messageType = jsonMessage.type;

    if (messageType == 'browsers') {
      jsonMessage.list.forEach(function (browser) {
        testBrowsers.push(new Browser(browser.id, browser.name, browser.timestamp));
      });
      return;
    }
    if (messageType == 'test') {
      result = jsonMessage.test.result;
      var test = new Test(result.description, result.suite, result.success, result.skipped, result.time, getBrowserById(jsonMessage.browserId));
      test.toString();
      return;    }
    if (messageType == 'browserComplete') {
      var browser = getBrowserById(jsonMessage.browserId);
      console.log("getting browser for " + jsonMessage.browserId);
      // browser.setStopTime(jsonMessage.browserComplete.timestamp);
      return;
    }
    if (messageType == 'runComplete') {
      console.log("Show browser statistic");
      return;
    }
    console.error("Unknown test reporter type in "+jsonMessage);
  }

  ws.on('message', function (message) {
    var jsonMessage = JSON.parse(message);

    handleMessage(jsonMessage);
    //console.log(jsonMessage + ",");

    ws.send('von Server empfangen: ' + message);
  });

});
