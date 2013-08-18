#!/bin/sh

echo -e 'Starting to build up development environment\n'

HOME_DIR=`pwd`


echo "Creating karma plugin for remote-reporter..."
# create a npm package from this environment
npm pack

# create directory outside to build development environment
cd ..

TEST_ENV=`pwd`
TEST_ENV=$TEST_ENV/karma-remote-reporter-test

echo "Build test environment in directory ${TEST_ENV}"

mkdir $TEST_ENV
cd $TEST_ENV

echo "Resolving Dependencies..."

npm install ws
npm install websocket
npm install $HOME_DIR/karma-remote-reporter-0.0.1.tgz

# link into home directories needed for running reporter
ln -s $HOME_DIR/development

cd $TEST_ENV/node_modules/karma-remote-reporter
mv index.js index.js.orig

# DANGEROUS: this must be a hard link to work. Feels ugly...
ln $HOME_DIR/index.js

cd $TEST_ENV

echo -e '\n\nFinished. You are now in the test environment folder'

echo "Now Start the test server: node development/lib/testwebsocketserver.js"

echo -e "Go to another terminal and do\n\ncd ${TEST_ENV}\n\n"

echo -e "Then start karma:\n\n karma start development/lib/karma.conf.js\n\n"

echo "All test results should also occur on output of the test server"

echo "-------------"

echo "For changes, go back to your checked-out project and edit those files."
echo "They are linked to the test environment. For changes at the test server, "
echo "you need to restart the node server."