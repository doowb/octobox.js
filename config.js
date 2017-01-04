'use strict';

var extend = require('extend-shallow');
var exists = require('fs-exists-sync');

var db = {};
var config = {};
if (exists('./config.json')) {
  config = require('./config.json');
} else {
  console.log();
  console.log('[WARNING]:', 'no `./config.json` file found.');
  console.log();
}

if (exists('./db/config.json')) {
  db = require('./db/config.json');
} else {
  db = {use_env_variable: 'DATABASE_URL'};
  console.log();
  console.log('[WARNING]:', 'no `./db/config.json` file found.');
  console.log();
}

config.env = process.env.NODE_ENV || 'development';
config = extend({
  'url': 'http://localhost:3000',
  'GITHUB_CLIENT_ID': process.env.GITHUB_CLIENT_ID || '',
  'GITHUB_CLIENT_SECRET': process.env.GITHUB_CLIENT_SECRET || '',
  db: db[config.env] || db
}, config);

module.exports = config;
