const winston = require('winston');

let instance = null;

/**
 * Singleton class
 */
class Logger {

  constructor() {
    const logLevel = process.env.NODE_ENV === 'development' ? 'silly' : 'verbose',
      consoleTransport = new winston.transports.Console({
        timestamp: true,
        level: logLevel
      });

    // No logging in test environment
    if (process.env.NODE_ENV === 'test') {
      this.logger = new (winston.Logger)({ transports: [] });
    } else {
      this.logger = new (winston.Logger)({
        transports: [consoleTransport]
      });
    }

    this.logger.log('warn', 'Logger initialized with log level: ' + logLevel);
    this.logger.log('warn', 'ENV: ' + process.env.NODE_ENV);
  }

  static getInstance() {
    if (instance === null || !instance.logger) {
      console.warn('Initializing logger...');
      instance = new Logger();
    }
    return instance;
  }

  add(logLevel, message, request) {
    if (request) {
      let filteredReq = [];
      filteredReq.push(request.route);
      filteredReq.push(request.user);
      filteredReq.push(request.params);
      this.logger.log(logLevel, message, {req : filteredReq});
    } else {
      this.logger.log(logLevel, message);
    }
  }

  /**
   * The Sequelize needs static method for logging
   * probably due to module caching
   */
  static logQuery(query) {
    if (!instance) {
      console.warn('Failed to log query: logger not initialized!');
      return;
    }
    instance.logger.log('info', query);
  }

}

module.exports = Logger;
