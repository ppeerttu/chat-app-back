const Logger = require('../lib/logger');
const Validator = require('../lib/validator');
const logger = Logger.getInstance();

let connections = {};
let count = 0;

module.exports = (io) => {

  /**
   * Handle incoming connections
   */
  io.on('connection', socket => {

    count++;

    logger.add('info', 'socket connected with id: ' + socket.id);
    logger.add('info', 'Connections count ' + count);

    /**
     * { roomId: <int>, userId: <int>, message: <string>, time: <int> }
     */
    socket.on('message', data => {
      if (
        !Validator.validateId(data.roomId)
        || !Validator.validateId(data.userId)
        || !Validator.validateId(data.time)
        || !Validator.validateMessage(data.message)
      ) {
        logger.add('warn', 'Received invalid data for \'message\' event from socket ' + socket.id);
        return;
      }
      logger.add('debug', 'roomId: ' + data.roomId +', userId: ' + data.userId + ', message: ' + data.message);
      logger.add('debug', Object.keys(socket.rooms));
      if (Object.keys(socket.rooms).includes(data.roomId.toString())) {
        socket.to(data.roomId).emit('message', data);
      } else {
        logger.add('debug', 'Trying to send into room where user is not!');
      }
    });

    /**
     * { roomId: <int>, user: <User> }
     */
    socket.on('join', data => {
      if (
        Validator.validateUser(data.user)
        || Validator.validateId(data.roomId)
      ) {
        const found = connections[data.user.userName];
        let connectionsCount = 1;
        if (found) {
          if (!doesSocketExist(found.sockets, socket)) {
            socket.userName = data.user.userName;
            found.sockets.push(socket);
            connectionsCount = found.sockets.length;
            logger.add('verbose', 'Adding another socket id into the existing connection');
          }
        } else {
          socket.userName = data.user.userName;
          connections[data.user.userName] = Object.assign({}, data.user, {
            sockets: [socket]
          });
        }
        socket.join(data.roomId, () => {
          //if (connectionsCount < 2) {
          socket.to(data.roomId).emit('userJoin', {
            socketId: socket.id,
            roomId: data.roomId,
            user: data.user
          });
          //}
        });
      } else {
        logger.add('warn', 'Received invalid data for \'join\' -event: ' + data);
      }
    });

    socket.on('userInfo', data => {
      if (
        Validator.validateId(data.roomId)
        && Validator.validateUser(data.user)
      ) {
        socket.to(data.socketId).emit('userInfo', {
          roomId: data.roomId,
          user: data.user
        });
      } else {
        logger.add('warn', 'Socket ' + socket.id + ' trying to send userInfo with invalid data!');
      }
    });

    /**
     * { roomId: <int>, user: <User> }
     */
    socket.on('leave', data => {
      if (
        !Validator.validateId(data.roomId)
        || !Validator.validateUser(data.user)
      ) {
        logger.add('warn', 'Socket ' + socket.id + ' trying to send leave request with invalid data!');
        return;
      }
      logger.add('debug', 'Received leave request from client: ');
      logger.add('debug', data);
      socket.to(data.roomId).emit('userLeave', data);
      let user = connections[data.user.userName];
      if (user) {
        user.sockets.map(conn => {
          conn.leave(data.roomId);
        });
      }
    });

    socket.on('disconnecting', reason => {
      const id = socket.id;
      logger.add('info', 'Socket connection closing: ' + reason);
      if (reason === 'client namespace disconnect') {
        const rooms = Object.keys(socket.rooms);
        rooms.forEach(room => {
          logger.add('debug', room);
          if (room !== id) {
            const user = connections[socket.userName];
            if (user) {
              socket.to(room).emit('userLeave', { roomId: room, user: {
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                id: user.id
              }});
            }

          }
        });
        connections[socket.userName].sockets.map(item => {
          if (item.id !== id) item.disconnect();
        });
        delete connections[socket.userName];
      }
      count--;
      logger.add('verbose', 'Connections count: ' + count);
    });
  });
};

function doesSocketExist(collection, socket) {
  for (let i = 0; i < collection.length; i++) {
    if (collection[i].id === socket.id) return true;
  }
  return false;
}
