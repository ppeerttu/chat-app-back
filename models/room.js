'use strict';
module.exports = function(sequelize, DataTypes) {
  const Room = sequelize.define('Room', {
    roomName: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
  });
  return Room;
};
