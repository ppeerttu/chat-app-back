const Sequelize = require('sequelize'),
  ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
  conf = require('../config/config.js')[ENV],
  db = conf.database,
  host = conf.host,
  port = conf.port,
  username = conf.username,
  password = conf.password,
  dialect = conf.dialect,
  Logger = require('../lib/logger');

let opts = {
  host: host,
  dialect: dialect,
  port: port,
  logging: false
};

// No logging in test environment
if (ENV !== 'test') opts = Object.assign({}, opts, { logging: Logger.logQuery });

const sequelize = new Sequelize(db, username, password, opts);

module.exports = {
  DataTypes: Sequelize,
  sequelize: sequelize
};
