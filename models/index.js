
const Database = require('../db/connection');
const User = require('./user')(Database.sequelize, Database.DataTypes);
const Room = require('./room')(Database.sequelize, Database.DataTypes);
const Message = require('./message')(Database.sequelize, Database.DataTypes);
const UserInRoom = require('./userinroom')(Database.sequelize, Database.DataTypes);

/**
 * Since Sequelize V4 has removed classMethdos, associations are defined here
 * Instance methods are defined at model's definition and it is in prototype form:
 * Model.protptype.method = function(param) {...}
 */
User.belongsToMany(Room, {
  as: 'Joined',
  through: UserInRoom,
  foreignKey: 'userId'
});
// Rooms and Users have two relations; one-to-many and many-to-many through UserInRoom
Room.belongsTo(User, { as: 'user' });
Room.belongsToMany(User, {
  as: 'Participant',
  through: UserInRoom,
  foreignKey: 'roomId'
});

Message.belongsTo(User, { as: 'user' });
Message.belongsTo(Room, { as: 'room' });

module.exports = {
  User: User,
  Room: Room,
  Message: Message,
  UserInRoom: UserInRoom,
  sequelize: Database.sequelize
};
