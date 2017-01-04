'use strict';

var express = require('express');

module.exports = function(config) {
  return function(app) {
    var router = express.Router();
    router.get('/', function(req, res, next) {
      if (req.isAuthenticated()) {
        res.redirect('/notifications');
        return;
      }

      res.render('home', {title: 'Node Octobox'});
    });

    router.get('/login', function(req, res) {
      res.redirect('/sessions/new');
    });

    router.get('/logout', function(req, res) {
      res.redirect('/sessions/destroy');
    });

    return router;
  };
}
