'use strict';

var controllers = require('export-files')(__dirname);

module.exports = function(config) {
  return {
    application: controllers.application(config),
    authentication: controllers.authentication(config),
    notifications: controllers.notifications(config),
    sessions: controllers.sessions(config)
  };
};
