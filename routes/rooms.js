const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 12;
const Models = require('../models');
const Logger = require('../lib/logger');
const logger = Logger.getInstance();
const Validator = require('../lib/validator');

// GET /rooms/all
router.get('/all', (req, res, next) => {
  Models.Room.findAll({
    attributes: {
      exclude: ['password'],
      include: [[Models.sequelize.literal('CASE WHEN "password" IS NOT NULL THEN true ELSE false END'), 'secret']]
    }
  }).then(rooms => {
    res.send(rooms);
  }).catch(err => {
    res.status(500).json({ error: 'Error occurred while fetching rooms: ' + err.message });
    logger.add('error', 'Error occurred while fetching rooms: ' + err.message);
  });
});

// POST /rooms/new
router.post('/new', (req, res, next) => {
  let data = req.body;
  logger.add('debug', data);
  if (
    !Validator.validateRoomName(data.roomName)
    || !Validator.validateId(data.userId)
    || (data.password && !Validator.validateRoomPassword(data.password))
  ) {
    res.status(400).json({ error: 'Invalid parameters roomName and/or userId.'});
    logger.add('warn', 'Invalid parameters roomName and/or userId');
  } else {
    data.userId = parseInt(data.userId);
    if (!data.password) {
      data.password = null;
    } else {
      data.password = bcrypt.hashSync(data.password, saltRounds);
    }
    Models.Room.findOrCreate({
      where: {
        roomName: data.roomName
      },
      defaults: data
    }).spread((instance, created) => {
      if (created) {
        let secret = false;
        if (instance.dataValues.password) {
          secret = true;
        }
        delete instance.dataValues.password;
        res.status(201).json(Object.assign({}, instance.dataValues, {secret}));
      } else {
        logger.add('warn', 'This roomName has already been taken!');
        res.status(409).json({ error: 'This roomName has already been taken!'});
      }
    }).catch(err => {
      res.status(400).json({ error: 'Creating a new room failed: ' + err.message });
      logger.add('error', err.message);
    });
  }
});

// POST /rooms/join/:id
router.post('/join/:id', (req, res, next) => {
  const data = Object.assign({}, req.body);
  const roomId = req.params.id;
  if (
    !Validator.validateRoomPassword(data.password)
    || !Validator.validateId(roomId)
    || !Validator.validateId(data.userId)
  ) {
    res.status(400).json({ error: 'Invalid parameters!' });
  } else {
    Models.Room.findById(roomId).then(room => {
      if (room) {
        let matches = true;
        if (room.dataValues.password !== null) {
          matches = bcrypt.compareSync(data.password, room.dataValues.password);
        }
        if (!matches) {
          return new Promise((resolve, reject) => { reject({ status: 403, message: 'Wrong password' }); });
        } else {
          return room;
        }
      } else {
        return new Promise((resolve, reject) => { reject({ status: 404, message: 'Room not found' }); });
      }
    })
    .then((room) => {
      return Models.User.findById(data.userId).then(user => {
        if (user) {
          return [room, user];
        }
        return new Promise((resolve, reject) => { reject({ status: 404, message: 'User not found' }); });
      });
    })
    .then(results => {
      const user = results[1];
      const room = results[0];
      return user.addJoined(room, { through: { active: true }});
    })
    .then(results => {
      if (results[0] && results[0].length > 0) {
        res.status(200).json({ roomId: roomId });
      } else {
        return new Promise((resolve, reject) => { reject({ status: 400, message: 'Failed to add user in room.' +
         ' This happended most likely because user is already in this room.' }); });
      }
    }).catch(err => {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    });
  }
});

// POST /rooms/leave/:id
router.post('/leave/:id', (req, res, next) => {
  const data = req.body;
  const roomId = req.params.id;
  if (
    !Validator.validateId(data.userId)
    || !Validator.validateId(roomId)
  ) {
    logger.add('warn', 'Leaving room but invalid parameters!');
    res.status(400).json({ error: 'Invalid parameters! '});
  } else {
    Models.UserInRoom.find({
      where: {
        userId: data.userId,
        roomId: roomId
      }
    })
    .then(userInRoom => {
      if (userInRoom) {
        return userInRoom;
      } else {
        return new Promise((resolve, reject) => { reject({ status: 400, message:'Relation not found!'}); });
      }
    })
    .then(userInRoom => userInRoom.deactivate())
    .then(() => {
      res.status(200).json({ roomId: roomId});
    })
    .catch(err => {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    });
  }
});

// GET /rooms/in/:id
router.get('/in/:id', (req, res, next) => {
  const userId = req.params.id;
  if (!Validator.validateId(userId)) {
    res.status(400).json({ error: 'UserId not valid!' });
  } else {
    Models.User.findById(userId).then(user => {
      if (user) {
        return user.getJoined({
          attributes: {
            exclude: ['password'],
            include: [[Models.sequelize.literal('CASE WHEN "password" IS NOT NULL THEN true ELSE false END'), 'secret']]
          }
        });
      } else {
        return new Promise((resolve, reject) => { reject({ status: 400, message: 'User not found with given id!' }); });
      }
    })
    .then(rooms => {
      const validated = rooms.reduce((rooms, room) => {
        if (room.UserInRoom.active) {
          //delete room.dataValue.password;
          rooms.push(room);
        }
        return rooms;
      }, []);
      res.send(validated);
    })
    .catch(err => {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    });
  }
});

module.exports = router;
