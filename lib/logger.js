const winston = require('winston');

let instance = null;

/**
 * Singleton class
 */
class Logger {

  static getInstance() {
    return instance;
  }

  static init() {
    // Return early if logger has already been initialized
    if (instance) return;

    const logLevel = process.env.NODE_ENV === 'development' ? 'silly' : 'verbose',
      consoleTransport = new winston.transports.Console({
        timestamp: true,
        level: logLevel
      });

    // No logging in test environment
    if (process.env.NODE_ENV === 'test') {
      instance = new (winston.Logger)({ transports: [] });
    } else {
      instance = new (winston.Logger)({
        transports: [
          consoleTransport
        ]
      });
    }

    instance.log('warn', 'Logger initialized with log level: ' + logLevel);
    instance.log('warn', 'ENV: ' + process.env.NODE_ENV);
  }

  static add(logLevel, message, request) {
    // Return early if logger has not been initialized
    if (instance === null) {
      Logger.init();
    }
    if (request) {
      let filteredReq = [];
      filteredReq.push(request.route);
      filteredReq.push(request.user);
      filteredReq.push(request.params);
      instance.log(logLevel, message, {req : filteredReq});
    } else {
      instance.log(logLevel, message);
    }
  }

  static logQuery(query) {
    instance.log('info', query);
  }

}

module.exports = Logger;
