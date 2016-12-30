'use strict';

var express = require('express');
var passport = require('passport');
var extend = require('extend-shallow');
var User = require('../models/user');
var GitHubStrategy = require('passport-github2').Strategy;

module.exports = function(config) {
  config = extend({}, config);

  var GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
  var GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;

  return function(app) {
    passport.serializeUser(function(user, cb) {
      cb(null, {github_id: user.github_id, github_login: user.github_login, access_token: user.access_token});
    });

    passport.deserializeUser(function(obj, cb) {
      cb(null, new User(obj));
    });

    var url = app.get('url');
    var opts = {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${url}/auth/github/callback`
    };

    var strategy = new GitHubStrategy(opts, function(accessToken, refreshToken, profile, cb) {
      var user = new User({
        github_id: profile.id,
        github_login: profile.username,
        access_token: accessToken
      });

      cb(null, user);
    });

    passport.use(strategy);

    app.use(passport.initialize());
    app.use(passport.session());

    var router = express.Router();
    router.get('/github', passport.authenticate('github', {scope: ['notifications']}))
    router.get('/github/callback',
      passport.authenticate('github', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/sessions/create');
      });

    return router;
  };
}
