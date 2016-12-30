'use strict';

var express = require('express');

module.exports = function(config) {
  return function(app) {
    var router = express.Router();
    router.get('/new', function(req, res) {
      res.redirect('/auth/github');
    });

    router.route('/create')
      .get(handleCreate)
      .post(handleCreate);

    router.route('/destroy')
      .get(handleDestroy)
      .post(handleDestroy);

    return router;

    function handleCreate(req, res) {
      res.redirect(app.get('root_path'));
    }

    function handleDestroy(req, res) {
      req.logout();
      res.redirect(app.get('root_path'));
    }
  };
}
