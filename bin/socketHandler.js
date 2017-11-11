const Logger = require('../lib/logger'),
  logger = new Logger();

let connections = {};

module.exports = (io) => {

  /**
   * Handle incoming connections
   */
  io.on('connection', socket => {

    logger.add('info', 'socket connected with id: ' + socket.id);

    connections[socket.id] = {};
    /**
     * { roomId: <int>, userId: <int>, message: <string>, time: <int> }
     */
    socket.on('message', data => {
      logger.add('info', 'roomId: ' + data.roomId +', userId: ' + data.userId + ', message: ' + data.message);
      socket.to(data.roomId).emit('message', data);
      logger.add('info', Object.keys(socket.rooms));
    });

    /**
     * { roomId: <int>, user: <User> }
     */
    socket.on('join', data => {
      connections[socket.id] = Object.assign({}, data.user);
      logger.add('info', 'Received join request from client: ' + data.user.userName);
      socket.join(data.roomId, () => {
        socket.to(data.roomId).emit('userJoin', {
          socketId: socket.id,
          roomId: data.roomId,
          user: data.user
        });
      });
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
      logger.add('info', 'Received leave request from client: ');
      logger.add('info', data);
      socket.to(data.roomId).emit('userLeave', data);
      socket.leave(data.roomId);
    });

    socket.on('disconnecting', data => {
      const rooms = Object.keys(socket.rooms);
      const id = socket.id;
      logger.add('info', 'Socket connection closing: ' + data);
      logger.add('info', rooms);
      rooms.forEach(room => {
        logger.add('info', room);
        if (room !== id) {
          socket.to(room).emit('userLeave', { roomId: room, user: connections[socket.id] });
        }
      });
      delete connections[socket.id];
    });
  });
};
