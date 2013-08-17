#!/bin/sh

HOME_DIR=`pwd`

# create a npm package from this environment
npm pack

# create directory outside to build development environment
cd ..
mkdir karma-remote-reporter-test
cd  karma-remote-reporter-test

TEST_ENV=`pwd`
echo "Build test environment in directory ${TEST_ENV}"

npm install ws
npm install websocket
npm install $HOME_DIR/karma-remote-reporter-0.0.1.tgz
ln -s $HOME_DIR/test

echo "Finished"

echo "Now Start the test server: node test/lib/testwebsocketserver.js"

echo "Go to another terminal and do cd ${TEST_ENV}"

echo "Then start karma: karma start test/lib/karma.conf.js"

echo "All test results should also occur on output of the test server"