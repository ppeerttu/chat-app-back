const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressJWT = require('express-jwt');
const cors = require('cors');

const index = require('./routes/index');
const users = require('./routes/users');
const rooms = require('./routes/rooms');

const app = express();

// CORS setup
let whiteList;
if (process.env.NODE_ENV === 'production') {
  whiteList = ['http://www.perttukarna.com', 'http://perttukarna.com'];
} else {
  whiteList = ['http://localhost:3300', 'http://localhost:4200'];
}
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(expressJWT({ secret: 'testy secret 5' }).unless({ path: ['/api/users/login', '/api/users/register']}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', index);
app.use('/api/users', users);
app.use('/api/rooms', rooms);
app.options('*', cors());

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
