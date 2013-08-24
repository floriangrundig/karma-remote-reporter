karma-remote-reporter
=====================

Prerequisites
-------------

* install node.js (http://nodejs.org/download/)
* install karma (http://karma-runner.github.com)
* install ws for nodejs: npm install ws
* install websocket for nodejs: npm install websocket


Basics
------
This application is about creating a javascript-based artefact that is able to send test results
to a configured server via websocket. Tests are executed in a karma environment.

This software is intended to become a Karma plugin which enables test reporting via websockets to a remote server.
Report results in junit style via websockets to a configurable remote server...

Development
-----------
To work at the plugin we need to build a test environment. It has three components:

* the karma-remote-report plugin
* test environment to execute karma with this plugin
* a nodejs test instance to receive test messages

Unfortunately it's not possible to keep development stuff in the same directory. So there is a script to build
a development environment.

Simply go to the home directory of this project and do

. scripts/development.sh

After finished this script, see output. It has the follow-up commands to start node testserver and to start karma.

