var path = require('path');
var logger = require('morgan');
var express = require('express');
var extend = require('extend-shallow');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var consolidate = require('consolidate');
consolidate.requires.handlebars = require('handlebars');
var cookieParser = require('cookie-parser');

module.exports = function(config) {
  var app = express();

  // allow checking if the protocol was https or not on heroku
  app.enable('trust proxy');
  app.set('url', config.url || 'http://localhost:3000');
  app.set('root_path', '/');

  // view engine setup
  app.set('handlebars', consolidate.requires.handlebars);
  app.engine('hbs', consolidate.handlebars);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  if (config.ga) {
    app.locals.ga = extend({}, config.ga);
  }

  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(function(req, res, next) {
    if (req.hostname === 'localhost') {
      return next();
    }
    if(req.headers["x-forwarded-proto"] === "https"){
      return next();
    };
    res.redirect('https://'+req.hostname+req.url);
  });

  var routes = require('./routes')(config);
  routes(app);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if(app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

  return app;
};
