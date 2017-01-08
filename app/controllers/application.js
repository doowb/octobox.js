'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');

module.exports = function(config) {
  return function(app) {
    var router = express.Router();
    router.get('/', function(req, res, next) {
      if (req.isAuthenticated()) {
        res.redirect('/notifications');
        return;
      }

      res.render('home', {
        title: 'Octobox.js',
        partials: getPartials(app)
      });
    });

    router.get('/login', function(req, res) {
      res.redirect('/sessions/new');
    });

    router.get('/logout', function(req, res) {
      res.redirect('/sessions/destroy');
    });

    if (config.letsencrypt) {
      // only send this value back if the let's encrypt ssl certifications have been configured
      router.get('/.well-known/acme-challenge/:key', function(req, res, next) {
        var key = req.params.key;
        if (!key) return next();
        var keys = config.letsencrypt.key.split(',');
        var idx = keys.indexOf(key);
        if (idx === -1) return next();
        res.send(config.letsencrypt.value.split(',')[idx]);
      });
    }
    return router;
  };
};

function getPartials(app) {
  var partials = fs.readdirSync(path.join(app.get('views'), 'partials'));
  return partials.reduce(function(acc, filename) {
    var ext = path.extname(filename);
    var basename = path.basename(filename, ext);
    acc[basename] = path.join('partials', basename);
    return acc;
  }, {});
}

