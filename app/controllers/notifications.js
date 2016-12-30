'use strict';

var fs = require('fs');
var co = require('co');
var path = require('path');
var express = require('express');
var models = require('../models');
var helpers = require('../helpers');

module.exports = function(config) {
  return function(app) {
    var router = express.Router();
    router.get('/', function(req, res, next) {
      if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
      }


      var q = req.query;

      // re-register the helpers with handlebars with the current params
      helpers.application(app, q);
      helpers.notifications(app, q);

      var scopes = [];

      if (q['starred']) {
        scopes.push('starred');
      } else if (q['archived']) {
        scopes.push('archived');
      } else {
        scopes.push('inbox');
      }

      co(function*() {
        var context = {
          title: 'Notifications',
          partials: getPartials(app),
          params: q
        };

        var subScopes = ['repo', 'reason', 'type', 'status', 'owner'];
        subScopes.forEach(function(scope) {
          if (q.hasOwnProperty(scope)) {
            var val = q[scope];
            scopes.push({method: [scope, val]});
          }
        });

        var counter = getCounts(req.user, scopes);
        context['types'] = yield counter('subject_type');
        context['statuses'] = yield counter('unread');
        context['reasons'] = yield counter('reason');
        context['unread_repositories'] = yield counter('repository_full_name');

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
        .scope(scopes)
        .count({
          attributes: [col],
          // scope: scopes,
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

  function getPartials(app) {
    var partials = fs.readdirSync(path.join(app.get('views'), 'partials'));
    return partials.reduce(function(acc, filename) {
      var ext = path.extname(filename);
      var basename = path.basename(filename, ext);
      acc[basename] = path.join('partials', basename);
      return acc;
    }, {});
  }
}
