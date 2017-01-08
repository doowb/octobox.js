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
  url: process.env.URL || 'http://localhost:3000',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  db: db[config.env] || db
}, config);

if (process.env.GA_TRACKING_ID) {
  if (!config.ga) {
    config.ga = {trackingId: process.env.GA_TRACKING_ID};
  } else {
    config.ga.trackingId = process.env.GA_TRACKING_ID || config.ga.trackingId;
  }
}

if (process.env.LETSENCRYPT_KEY && process.env.LETSENCRYPT_VALUE) {
  if (!config.letsencrypt) {
    config.letsencrypt = {
      key: process.env.LETSENCRYPT_KEY,
      value: process.env.LETSENCRYPT_VALUE
    };
  } else {
    config.letsencrypt.key = process.env.LETSENCRYPT_KEY || config.letsencrypt.key;
    config.letsencrypt.value = process.env.LETSENCRYPT_VALUE || config.letsencrypt.value;
  }
}

module.exports = config;
