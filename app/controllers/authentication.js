'use strict';

var co = require('co');
var express = require('express');
var passport = require('passport');
var extend = require('extend-shallow');
var GitHubStrategy = require('passport-github2').Strategy;

module.exports = function(config) {
  config = extend({}, config);
  var models = require('../models')(config);

  var GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
  var GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;

  return function(app) {
    passport.serializeUser(function(user, cb) {
      cb(null, user.id);
    });

    passport.deserializeUser(function(id, cb) {
      models.User
        .findById(id)
        .then(function(user) {
          cb(null, user);
        })
        .catch(cb);
    });

    var url = app.get('url');
    var opts = {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${url}/auth/github/callback`
    };

    var strategy = new GitHubStrategy(opts, function(accessToken, refreshToken, profile, cb) {
      co(function*() {
        var result = yield models.User
          .findOrInitialize({where: {github_id: profile.id}});

        var user = result[0];
        user.set({github_id: profile.id, github_login: profile.username, access_token: accessToken});
        return yield user.save();
      })
      .then(function(user) {
        cb(null, user);
      })
      .catch(cb);
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
