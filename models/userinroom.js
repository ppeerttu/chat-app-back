'use strict';
module.exports = function(sequelize, DataTypes) {
  var UserInRoom = sequelize.define('UserInRoom', {
    active: DataTypes.BOOLEAN
  }, {
  });

  /**
   * Deactive UserInRoom
   * Used when user leaves a room (this relation is no longer active)
   */
  UserInRoom.prototype.deactivate = function() {
    this.active = false;
    return this.save();
  };
  return UserInRoom;
};
