const winston = require('winston');

class Logger {

  init() {
    const logLevel = process.env.NODE_ENV === 'development' ? 'silly' : 'verbose',
      consoleTransport = new winston.transports.Console({
        timestamp: true,
        level: logLevel
      });

    winston.configure({
      level: logLevel,
      transports: [
        consoleTransport
      ]
    });

    winston.log('warn', 'Logger initialized with log level: ' + logLevel);
    winston.log('warn', 'ENV: ' + process.env.NODE_ENV);
  }

  add(logLevel, message, request) {

    if (request) {
      /*
      if (request.params.password) {
        // censor password
      }
      if (request.params.username) {
        // censor username
      }
      */
      var filteredReq = [];
      filteredReq.push(request.route);
      filteredReq.push(request.user);
      filteredReq.push(request.params);
      winston.log(logLevel, message, {req : filteredReq});
    } else {
      winston.log(logLevel, message);
    }
  }

  logQuery(query) {
    winston.log('info', query);
  }

}

module.exports = Logger;
