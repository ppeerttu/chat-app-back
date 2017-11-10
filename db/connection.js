const Sequelize = require('sequelize'),
  conf = require('../config/config.js')['development'],
  db = conf.database,
  host = conf.host,
  port = conf.port,
  username = conf.username,
  password = conf.password,
  dialect = conf.dialect,
  Logger = require('../lib/logger'),
  logger = new Logger();

const sequelize = new Sequelize(db, username, password, {
  host: host,
  dialect: dialect,
  port: port,
  logging: logger.logQuery
});

module.exports = {
  DataTypes: Sequelize,
  sequelize: sequelize
};
