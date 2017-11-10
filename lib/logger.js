const winston = require('winston');

function Logger () { }

Logger.prototype = {
  init: () => {
    const logLevel = 'silly',
      filePath = __dirname + '/logs/logger.log',

      consoleTransport = new winston.transports.Console({
        colorize: true,
        timestamp: true,
        level: 'silly'
      });


    // No log rotate in test environment
    winston.configure({
      level: logLevel,
      transports: [
        consoleTransport
      ]
    });

    winston.log('warn', 'Logger initialized with log level: ', logLevel, ' and path: ', filePath);
    winston.log('warn', 'ENV: ' + process.env.NODE_ENV);
  },

  add: (logLevel, message, request) => {

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
  },

  logQuery: (query) => {
    winston.log('info', query);
  }
};

module.exports = Logger;
