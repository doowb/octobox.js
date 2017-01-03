'use strict';

var co = require('co');
var moment = require('moment');
var extend = require('extend-shallow');
var define = require('define-property');

var githubapi = 'https://api.github.com';
var githuburl = 'https://github.com';

module.exports = function(sequelize, types) {
  var Notification = sequelize.define('Notification', {
    github_id: types.INTEGER,
    repository_id: types.INTEGER,
    repository_full_name: types.STRING,
    subject_title: types.STRING,
    subject_url: types.STRING,
    subject_type: types.STRING,
    reason: types.STRING,
    unread: types.BOOLEAN,
    updated_at: types.DATE,
    last_read_at: types.STRING,
    url: types.STRING,
    archived: {
      type: types.BOOLEAN,
      defaultValue: false
    },
    starred: {
      type: types.BOOLEAN,
      defaultValue: false
    },
    repository_owner_name: types.STRING
  }, {
    getterMethods: {
      web_url: function() {
        return (this.subject_url || '')
          .replace(`${githubapi}/repos`, githuburl)
          .replace('/pulls/', '/pull/')
          .replace('/commits/', '/commit/');
      },
      repo_url: function() {
        return `${githuburl}/${this.repository_full_name}`;
      }
    },
    classMethods: {
      associate: function(models) {
        Notification.belongsTo(models.User);
      },
      download: function(user, cb) {
        var timestamp = moment();
        if (user.next_sync_at && (+timestamp < +user.next_sync_at)) {
          return cb();
        }

        user.downloadNotifications(function(err, notifications, res) {
          if (err) return cb(err);
          co(function*() {
            for (var i = 0; i < notifications.length; i++) {
              var notification = notifications[i];
              var result = yield Notification.findOrInitialize({
                where: {
                  UserId: user.id,
                  github_id: notification.id
                }
              });
              var n = result[0];

              if (n.archived && n.updated_at < notification.updated_at) {
                n.archived = false;
              }

              n.set({
                github_id: notification.id,
                repository_id: notification.repository.id,
                repository_full_name: notification.repository.full_name,
                repository_owner_name: notification.repository.owner.login,
                subject_title: notification.subject.title,
                subject_type: notification.subject.type,
                reason: notification.reason,
                unread: notification.unread,
                updated_at: notification.updated_at,
                last_read_at: notification.last_read_at,
                url: notification.url,
                subject_url: notification.subject.type === 'RepositoryInvitation'
                  ? `${notification.repository.html_url}/invitations`
                  : notification.subject.url
              });

              yield n.save();
            }

            user.last_synced_at = +timestamp;
            var delay = 60;
            if (res && res.headers && res.headers['x-poll-interval']) {
              delay = res.headers['x-poll-interval'];
            }
            user.next_sync_at = +timestamp.clone().add(delay, 'seconds');
            yield user.save();
          })
          .then(function() {
            cb();
          })
          .catch(cb);
        });
      }
    },
    scopes: {
      inbox: {where: {archived: false}},
      archived: {where: {archived: true}},
      newest: {order: 'updated_at DESC'},
      starred: {where: {starred: true}},

      repo: function(repo_name) {
        return {where: {repository_full_name: repo_name}};
      },
      type: function(subject_type) {
        return {where: {subject_type: subject_type}};
      },
      reason: function(reason) {
        return {where: {reason: reason}};
      },
      status: function(status) {
        return {where: {unread: status}};
      },
      owner: function(owner_name) {
        return {where: {repository_owner_name: owner_name}};
      }
    }
  });

  return Notification;
};
