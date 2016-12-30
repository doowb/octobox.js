'use strict';

var extend = require('extend-shallow');
var define = require('define-property');
var notifications = require('../lib/notifications');
var Notification = require('./notification');

function User(config) {
  if (!(this instanceof User)) {
    return new User(config);
  }

  config = extend({}, config);
  if (!config.github_id) throw new Error('expected "github_id" for the user');
  if (!config.access_token) throw new Error('expected "access_token" for the user');
  if (!config.github_login) throw new Error('expected "github_login" for the user');

  this.github_id = config.github_id;
  this.access_token = config.access_token;
  this.github_login = config.github_login;

  define(this, 'notifications', {});
  define(this, 'avatar', {
    enumerable: true,
    get: function() {
      return `https://github.com/${this.github_login}.png`;
    }
  });
}

User.prototype.sync = function(cb) {
  Notification.download(this, cb);
};

User.prototype.downloadNotifications = function(cb) {
  var options = {
    lastSynced: this.lastSynced,
    token: this.access_token
  };
  notifications(options, cb);
};

module.exports = User;
