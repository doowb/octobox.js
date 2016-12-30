'use strict';

var express = require('express');

module.exports = function(config) {
  return function(app) {
    var router = express.Router();
    router.get('/', function(req, res, next) {
      if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
      }
      req.user.sync(function(err) {
        if (err) return next(err);
        res.render('notifications', {
          title: 'Notifications',
          notifications: req.user.notifications
        });
      });
    });

    return router;
  };
}
