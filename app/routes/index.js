'use strict';

var controllers = require('../controllers');

module.exports = function(config) {
  var controller = controllers(config);
  return function(app) {
    app.use('/auth', controller.authentication(app));
    app.use(controller.application(app));
    app.use('/sessions', controller.sessions(app));
    app.use('/notifications', controller.notifications(app));
  };
};
