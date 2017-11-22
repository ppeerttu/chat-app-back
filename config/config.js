/* eslint-disable quotes */

module.exports = {
  development: {
    host: "db",
    port: 5432,
    database: process.env.POSTGRES_DB,
    dialect: 'postgres',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData'
  },
  test: {
    host: "db_test",
    port: 5432,
    database: process.env.POSTGRES_DB,
    dialect: 'postgres',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData'
  },
  production: {
    host: "db",
    port: 5432,
    database: process.env.POSTGRES_DB,
    dialect: 'postgres',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData'
  },
  continous_integration: {
    host: '127.0.0.1',
    port: 5432,
    database: process.env.POSTGRES_DB,
    dialect: 'postgres',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData'
  }
};
