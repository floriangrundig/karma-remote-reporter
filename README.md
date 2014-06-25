karma-remote-reporter
=====================

Current Version 0.1.4

History
-------
Version 0.1.5:
* fixed compatibility bug with karma 0.12.x 

Version 0.1.4:
* the remote reporter will recognize the command line argument --remoteReporterPort=ANY_NUMBER to configure the remote report server port

Version 0.1.3:
* syntax error will be reported

Version 0.1.2:
* Bugfix: karma-remote-reporter will wait per default 1000ms onExit-Event to finish reporting (this is configurable with "finishDelay")

Prerequisites
-------------

* install node.js (http://nodejs.org/download/)
* install karma (http://karma-runner.github.com)
    * do to some bugs in karma (v0.11.0) the required karma version is limited to v0.10.x
* in your apps package.json add karma and the following dependency: "karma-remote-reporter" : ">=0.1.x"

Basics
------
This application is about creating a javascript-based artefact that is able to send test results
to a configured server via websocket. Tests are executed in a karma environment.

This software is intended to become a Karma plugin which enables test reporting via websockets to a remote server.
Report results in junit style via websockets to a configurable remote server...

Development
-----------
To work at the plugin we need to build a test environment. It has three components:

* install ws for nodejs: npm install ws
* the karma-remote-report plugin
* test environment to execute karma with this plugin
* a nodejs test instance to receive test messages

Unfortunately it's not possible to keep development stuff in the same directory. So there is a script to build
a development environment.

Simply go to the home directory of this project and do

. scripts/development.sh

After finished this script, see output. It has the follow-up commands to start node testserver and to start karma.

