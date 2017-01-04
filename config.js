'use strict';

var exists = require('fs-exists-sync');
var config = {};
if (exists('./config.json')) {
  config = require('./config.json');
} else {
  console.log();
  console.log('[WARNING]:', 'no `config.json` file found.');
  console.log();
}

module.exports = config;
