'use strict';

var fs = require('fs');
var co = require('co');
var path = require('path');
var qs = require('querystring');
var express = require('express');
var helpers = require('../helpers');

module.exports = function(config) {
  var models = require('../models')(config);
  return function(app) {
    var router = express.Router();
    router.get('/', function(req, res, next) {
      if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
      }

      var q = req.query;
      q.per_page = q.per_page || 20;

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
          pagination_intervals: [20, 40, 60, 80, 100],
          user: req.user,
          partials: getPartials(app),
          params: q,
          filters: q
        };

        // get these values before adding the sub-scopes
        var counter = getCounts(req.user, scopes);
        context['types'] = yield counter('subject_type');
        context['statuses'] = yield counter('unread');
        context['reasons'] = yield counter('reason');
        context['unread_repositories'] = yield counter('repository_full_name');

        var subScopes = ['repo', 'reason', 'type', 'status', 'owner'];
        subScopes.forEach(function(scope) {
          if (q.hasOwnProperty(scope)) {
            var val = q[scope];
            scopes.push({method: [scope, val]});
          }
        });

        // get all to calculate pagination
        var notifications = yield req.user.getNotifications({scope: scopes});
        var page = +(q.page || 1);
        var pagination = {
          first: 1,
          page: page,
          per_page: +(q.per_page || 20)
        };

        if (pagination.per_page < 20) pagination.per_page = 20;
        if (pagination.per_page > 100) pagination.per_page = 100;

        var count = notifications.length;
        var total = Math.ceil(count / pagination.per_page);
        pagination.page = Math.min(page, total);
        if (pagination.page < 1) pagination.page = 1;
        if (pagination.page !== page) {
          res.redirect('/notifications?' + qs.stringify(pagination));
          return;
        }

        pagination.last = total;
        pagination.previous = pagination.page - 1;
        if (pagination.previous < 1) {
          pagination.previous = 1;
        }

        pagination.next = pagination.page + 1;
        if (pagination.next > pagination.last) {
          pagination.next = pagination.last;
        }

        pagination.pages = [];
        for (var i = pagination.first; i <= pagination.last; i++) {
          pagination.pages.push({page_num: i});
        }

        scopes.push('newest');
        context['notifications'] = yield req.user.getNotifications({
          scope: scopes,
          offset: ((pagination.page - 1) * pagination.per_page),
          limit: pagination.per_page
        });

        context['pagination'] = pagination;
        res.render('notifications', context);
      })
      .catch(next);
    });

    router.post('/sync', function(req, res, next) {
      if (!req.isAuthenticated()) {
        res.json({error: 'Unauthenticated'});
        return;
      }

      req.user.sync(function(err) {
        if (err) return next(err);
        res.json({success: true});
      });
    });

    router.post('/archive_selected', function(req, res, next) {
      if (!req.isAuthenticated()) {
        res.json({error: 'Unauthenticated'});
        return;
      }
      var ids = arrayify(req.body['id[]']);
      var val = req.body.value;

      co(function*() {
        yield models.Notification.update({archived: val}, {
          where: {
            UserId: req.user.id,
            id: {'$in': ids}
          }
        });
        res.json({});
      })
      .catch(function(err) {
        console.error(err);
        console.error(err.stack);
        next(err);
      });
    });

    router.get('/:id/star', function(req, res, next) {
      if (!req.isAuthenticated()) {
        res.json({error: 'Unauthenticated'});
        return;
      }
      co(function*() {
        var notification = yield models.Notification.findById(req.params.id);
        if (!notification) {
          res.json({error: 'Not found'});
          return;
        }
        yield notification.update({starred: !notification.starred});
        res.json({});
      });
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
          where: {UserId: user.id},
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

  function arrayify(val) {
    return val ? (Array.isArray(val) ? val : [val]) : [];
  }
}
