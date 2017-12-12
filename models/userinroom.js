'use strict';
module.exports = function(sequelize, DataTypes) {
  var UserInRoom = sequelize.define('UserInRoom', {
    active: DataTypes.BOOLEAN
  }, {
  });

  UserInRoom.prototype.deactivate = function() {
    this.active = false;
    return this.save();
  };
  return UserInRoom;
};
