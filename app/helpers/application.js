'use strict';

var url = require('url');
var Engine = require('engine');
var omit = require('object.omit');
var octicon = require('helper-octicon');
var extend = require('extend-shallow');
var createFrame = require('create-frame');

module.exports = function(app, params) {
  var handlebars = app.get('handlebars');
  params = extend({}, params);

  const REASON_LABELS = {
    'comment': 'primary',
    'author': 'success',
    'state_change': 'info',
    'mention': 'warning',
    'assign': 'danger'
  };

  const SUBJECT_TYPES = {
    'RepositoryVulnerabilityAlert': 'key',
    'RepositoryInvitation': 'mail-read',
    'Issue': 'issue-opened',
    'PullRequest': 'git-pull-request',
    'Commit': 'git-commit',
    'Release': 'tag'
  };

  const ALERT_TYPES = {
    success: 'alert-success',
    error: 'alert-danger',
    alert: 'alert-warning',
    notice: 'alert-info'
  }.freeze

  handlebars.registerHelper('bootstrap_class_for', function(flash_type) {
    return ALERT_TYPES[flash_type.toLowerCase()] || flash_type.toLowerCase();
  });

  handlebars.registerHelper('notification_icon', function(subject_type) {
    return SUBJECT_TYPES[subject_type] || '';
  });

  handlebars.registerHelper('reason_label', function(reason) {
    return REASON_LABELS[reason] || 'default';
  });

  handlebars.registerHelper('octobox_icon', function(height) {
    return `<svg class='octobox-icon' height=${height} viewBox='0 0 14 16' version='1.1'>
  <path d='M13.58,4.71 L12.908,4.229 C12.766,3.566 12.461,2.994 12.025,2.522 C12.122,2.281 12.438,1.322 11.928,0.022 C11.928,0.022 11.14,-0.227 9.348,1.004 C8.949,0.892 8.536,0.833 8.118,0.8 L7,0 L5.882,0.8 C5.463,0.833 5.05,0.892 4.652,1.004 C2.86,-0.234 2.072,0.022 2.072,0.022 C1.562,1.322 1.877,2.281 1.975,2.522 C1.539,2.994 1.234,3.566 1.092,4.229 L0.42,4.71 C0.16,4.89 8.8817842e-16,5.19 8.8817842e-16,5.52 L8.8817842e-16,14 C8.8817842e-16,14.55 0.45,15 1,15 L13,15 C13.55,15 14,14.55 14,14 L14,5.52 C14,5.19 13.85,4.9 13.58,4.71 Z M13,13.5 L8.5,10.5 L13,7.5 L13,13.5 Z M2,14 L7,11 L12,14 L2,14 Z M1,7.5 L5.5,10.5 L1,13.5 L1,7.5 Z M7,10 L2.58,7.227 C2.541,7.011 2.515,6.787 2.515,6.548 C2.515,5.974 2.8,5.43 3.28,4.984 C4.083,4.245 5.455,4.637 7,4.637 C8.553,4.637 9.91,4.245 10.72,4.984 C11.207,5.43 11.485,5.966 11.485,6.548 C11.485,6.78 11.459,6.998 11.421,7.209 L7,10 Z M8.8828,5.2944 C8.3878,5.2944 7.9828,5.8904 7.9828,6.6384 C7.9828,7.3864 8.3878,7.9904 8.8828,7.9904 C9.3778,7.9904 9.7818,7.3864 9.7818,6.6384 C9.7818,5.8904 9.3848,5.2944 8.8828,5.2944 Z M5.1177,5.2944 C4.6227,5.2944 4.2177,5.8984 4.2177,6.6384 C4.2177,7.3784 4.6227,7.9904 5.1177,7.9904 C5.6127,7.9904 6.0177,7.3864 6.0177,6.6384 C6.0177,5.8904 5.6127,5.2944 5.1177,5.2944 Z'></path>
</svg>`;
  });

  handlebars.registerHelper('no_url_filter_parameters_present', function() {
    return ['archived', 'repo', 'type', 'status', 'reason', 'owner', 'starred'].filter(function(filter) {
      return params.hasOwnProperty(filter);
    }).length === 0;
  });

  handlebars.registerHelper('link-to', function(pathname, q, options) {
    if (typeof options === 'undefined') {
      options = q;
      q = {};
    }
    q = extend({}, q, options.hash);
    return url.format({pathname: pathname, query: q});
  });

  handlebars.registerHelper('octicon', octicon);
  handlebars.registerHelper('is', function(a, b, options) {
    var res = (a == b);
    if (options.fn) {
      return res ? options.fn(this) : options.inverse(this);
    }
    return res;
  });

  handlebars.registerHelper('or', function() {
    var args = [].slice.call(arguments);
    var options = args.pop();
    for (var i = 0; i < args.length; i++) {
      if (args[i] === true) {
        return true;
      }
    }
    return false;
  });

  handlebars.registerHelper('str', function(val) {
    return val.toString();
  });

  handlebars.registerHelper('boolean', function(val) {
    return Boolean(val);
  });

  handlebars.registerHelper('omit', function(obj) {
    var args = [].slice.call(arguments, 1);
    var options = args.pop();
    return omit(obj, args);
  });

  handlebars.registerHelper('empty', function(val) {
    if (!val || typeof val === 'undefined') return true;
    if (Array.isArray(val)) {
      return val.length === 0;
    }

    if (typeof val === 'object') {
      return Object.keys(val).length === 0;
    }
    return true;
  });

  handlebars.registerHelper('sidenav-repos', function(repos, options) {
    var frame = createFrame(options.data);
    frame.extend(options.hash);

    var html = '';
    var current_owner = null;
    for (var repo_name in repos) {
      var count = repos[repo_name];
      var segs = repo_name.split('/');
      var repo_owner = segs[0];
      var repo_label = segs[1];
      frame.extend({
        count: count,
        repo_name: repo_name,
        repo_owner: repo_owner,
        repo_label: repo_label,
        current_owner: current_owner
      });

      html += options.fn(this, {data: frame}) + '\n';
      if (current_owner !== repo_owner) {
        current_owner = repo_owner;
      }
    }
    return html;
  });

  handlebars.registerHelper('sort', function(arr) {
    if (Array.isArray(arr)) {
      arr.sort();
    } else if (typeof arr === 'object') {
      var keys = Object.keys(arr);
      keys.sort();
      var tmp = keys.reduce(function(acc, key) {
        acc[key] = arr[key];
        return acc;
      }, {});
      arr = tmp;
    }
    return arr;
  });

  handlebars.registerHelper('inject', function(str, locals, options) {
    if (typeof options === 'undefined') {
      options = locals;
      locals = {};
    }
    var context = extend({}, this, locals, options.hash);
    var engine = new Engine();
    return engine.compile(str)(context);
  });
};
