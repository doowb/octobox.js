'use strict';

var extend = require('extend-shallow');

module.exports = function(app, params) {
  var handlebars = app.get('handlebars');
  var filters = extend({}, params);

  handlebars.registerHelper('menu_separator', function(custom_class) {
    return `<li class='divider ${custom_class}'></li>`
  });

  handlebars.registerHelper('any_active_filters', function() {
    return ['status', 'reason', 'type', 'repo', 'owner'].filter(function(filter) {
      return filters.hasOwnProperty(filter);
    }).length !== 0;
  });

  handlebars.registerHelper('filtered_params', function(override, options) {
    if (typeof options === 'undefined') {
      options = override;
      override = {};
    }
    return extend({}, filters, override, options.hash);
  });

  handlebars.registerHelper('archive_selected_button', function(custom_class, options) {
    if (typeof options === 'undefined') {
      options = custom_class;
      custom_class = '';
    }

    var action = params.archive ? 'unarchive' : 'archive';
    return `<input type="button" class="archive_toggle ${action}_selected ${custom_class}">${action} selected</input>`;
  });
};
