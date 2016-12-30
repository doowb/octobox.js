'use strict';

var co = require('co');
var express = require('express');
var models = require('../models');

module.exports = function(config) {
  return function(app) {
    var router = express.Router();
    router.get('/', function(req, res, next) {
      if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
      }

      var q = req.query;
      var scopes = [];

      if (q['starred']) {
        scopes.push('starred');
      } else if (q['archived']) {
        scopes.push('archived');
      } else {
        scopes.push('inbox');
      }

      co(function*() {
        var counter = getCounts(req.user, scopes);

        var context = {title: 'Notifications'};
        context['types'] = yield counter('subject_type');
        context['statuses'] = yield counter('unread');
        context['reasons'] = yield counter('reason');
        context['unread_repositories'] = yield counter('repository_full_name');

        var subScopes = ['repo', 'reason', 'type', 'status', 'owner'];
        subScopes.forEach(function(scope) {
          if (q.hasOwnProperty(scope)) {
            scopes.push({method: [scope, q[scope]]});
          }
        });

        context['notifications'] = yield req.user.getNotifications({scope: scopes});

        res.render('notifications', context);
      })
      .catch(next);
    });

    return router;
  };

  function getCounts(user, scopes) {
    return function(col) {
      return models.Notification
        .count({
          attributes: [col],
          scope: scopes,
          where: {user_id: user.id},
          group: col
        })
        .then(function(rows) {
          return rows.reduce(function(acc, row) {
            acc[row[col]] = row.count;
            return acc;
          }, {});
        });
    };
  }
}
