'use strict';

var moment = require('moment');
var Github = require('github-base');

module.exports = function(options, cb) {
  var github = new Github(options);
  var since = moment().subtract(1, options.lastSynced ? 'week' : 'month');
  github.paged(`/notifications?all=true&since=${since.format()}`, cb);
};
