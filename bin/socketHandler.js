const logger = require('../lib/logger');

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
      if (data.user) {
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
      socket.to(data.socketId).emit('userInfo', {
        roomId: data.roomId,
        user: data.user
      });
    });

    /**
     * { roomId: <int>, user: <User> }
     */
    socket.on('leave', data => {
      if (
        !data.hasOwnProperty('roomId')
        || !data.hasOwnProperty('user')
      ) return;
      logger.add('debug', 'Received leave request from client: ');
      logger.add('debug', data);
      socket.to(data.roomId).emit('userLeave', data);
      if (data.user) {
        let user = connections[data.user.userName];
        if (user) {
          user.sockets.map(conn => {
            conn.leave(data.roomId);
          });
        }
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
            socket.to(room).emit('userLeave', { roomId: room, user: socket.userName });
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
