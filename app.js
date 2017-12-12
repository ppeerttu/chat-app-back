const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
//const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressJWT = require('express-jwt');
const winston = require('winston');
const expressWinston = require('express-winston');
const cors = require('cors');
const helmet = require('helmet');
const ENV = process.env.NODE_ENV;

const index = require('./routes/index');
const users = require('./routes/users');
const rooms = require('./routes/rooms');

const app = express();

app.use(cors());

if (ENV !== 'test') {
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        colorize: false,
        timestamp: true
      })
    ],
    expressFormat: true,
    colorize: false,
    meta: false
  }));
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cors(corsOptions));
app.use(expressJWT({ secret: 'testy secret 5' }).unless({ path: ['/api/users/login', '/api/users/register']}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use('/api/', index);
app.use('/api/users', users);
app.use('/api/rooms', rooms);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
