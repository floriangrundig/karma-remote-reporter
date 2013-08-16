karma-remote-reporter
=====================

THIS IS STILL WORK IN PROGRESS! A full documention how to use this plugin will follow soon.

Prerequisites
-------------

* install node.js (http://nodejs.org/download/)
* install karma (http://karma-runner.github.com)
* install websocket for nodejs: npm install ws


Basics
------
This application is about creating a javascript-based artefact that is able to send test results
to a configured server via websocket. Tests are executed in a karma environment.

This software is intended to become a Karma plugin which enables test reporting via websockets to a remote server.
Report results in junit style via websockets to a configurable remote server...

Testing remote reporter
-----------------------
For TESTING ISSUES there is a javascript called testwebsocket.js; it implements a handler that can
understand and change messages sent by the reporter.

For this test you will need two consoles: one for the karma test including the reporter client and
one for the server that handles reported messsages.

For the SERVER: go to the project root and start the nodejs server on console:

node test/lib/testwebsocketserver.js

For the KARMA TEST: go to the project root and start the karma test:

karma start test/lib/karma.conf.js

