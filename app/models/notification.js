'use strict';

var moment = require('moment');
var extend = require('extend-shallow');
var define = require('define-property');

var githubapi = 'https://api.github.com';
var githuburl = 'https://github.com';

function Notification(config) {
  if (!(this instanceof Notification)) {
    return new Notification(config);
  }
  config = extend({}, config);

  define(this, 'web_url', {
    enumerable: true,
    get: function() {
      return this.subject_url
        .replace(`${githubapi}/repos`, githuburl)
        .replace('/pulls/', '/pull/')
        .replace('/commits/', '/commit/');
    }
  });

  define(this, 'repo_url', {
    enumerable: true,
    get: function() {
      return `${githuburl}/${this.repository_full_name}`;
    }
  });

  this.update(config);
}

Notification.prototype.update = function(config) {
  this.github_id = config.id;
  this.repository_id = config.repository.id;
  this.repository_full_name = config.repository.full_name;
  this.repository_owner_name = config.repository.owner.login;
  this.subject_title = config.subject.title;
  this.subject_type = config.subject.type;
  this.reason = config.reason;
  this.unread = config.unread;
  this.updated_at = config.updated_at;
  this.last_read_at = config.last_read_at;
  this.url = config.url;

  this.subject_url = config.subject.type === 'RepositoryInvitation'
    ? `${config.repository.html_url}/invitations`
    : config.subject.url;
};

Notification.prototype.save = function() {};

Notification.download = function(user, cb) {
  var timestamp = moment();

  user.downloadNotifications(function(err, notifications) {
    if (err) return cb(err);
    notifications.forEach(function(notification) {
      var n = user.notifications[notification.id];
      if (!n) {
        n = new Notification(notification);
        user.notifications[n.github_id] = n;
      }

      if (n.archived && n.updated_at < notification.updated_at) {
        n.archived = false;
      }

      n.update(notification);
      n.save();
    });
    user.lastSynced = timestamp.format()
    cb();
  });
};

module.exports = Notification;
