'use strict';

var extend = require('extend-shallow');
var define = require('define-property');
var notifications = require('../lib/notifications');

module.exports = function(sequelize, types) {
  var User = sequelize.define('User', {
    github_id: {
      type: types.INTEGER,
      unique: true
    },
    access_token: {
      type: types.STRING,
      unique: true
    },
    github_login: types.STRING,
    last_synced_at: types.DATE,
    next_sync_at: types.DATE
  }, {
    getterMethods: {
      avatar: function() {
        return `https://github.com/${this.getDataValue('github_login')}.png`;
      }
    },
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Notification, {as: 'notifications'});
      }
    },
    instanceMethods: {
      sync: function(cb) {
        sequelize.models.Notification.download(this, cb);
      },
      downloadNotifications: function(cb) {
        var options = {
          lastSynced: this.last_synced_at,
          nextSync: this.next_sync_at,
          token: this.access_token
        };
        notifications(options, cb);
      }
    }
  });

  return User;
};
