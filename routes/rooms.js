const express = require('express');
const router = express.Router();
const Models = require('../models');
const Logger = require('../lib/logger');
const logger = new Logger();


// GET /rooms/all
router.get('/all', (req, res, next) => {
  Models.Room.findAll().then(rooms => {
    res.send(rooms);
  });
});

// POST /rooms/new
router.post('/new', (req, res, next) => {
  const data = req.body;
  logger.add('info', data);
  if (!data.roomName) {
    res.status(400).json({ error: 'Invalid parameters!'});
  } else {
    if (!data.password) {
      data.password = null;
    }
    Models.Room.findOrCreate({
      where: {
        roomName: data.roomName
      },
      defaults: data
    }).spread((instance, created) => {
      if (created) {
        res.send(instance);
      } else {
        res.status(409).json({ error: 'This roomName has already been taken!'});
      }
    }).catch(err => {
      logger.add('error', err);
    });
  }
});

// POST /rooms/join/:id
router.post('/join/:id', (req, res, next) => {
  const data = Object.assign({}, req.body);
  const roomId = req.params.id;
  if (!data.hasOwnProperty('password')|| !roomId || isNaN(parseInt(roomId)) || !data.userId) {
    res.status(400).json({ error: 'Invalid parameters!' });
  } else {
    Models.Room.findById(roomId).then(room => {
      if (room.dataValues.password !== null && room.dataValues.password != data.password) {
        res.sendStatus(403);
      } else {
        Models.User.findById(data.userId).then(user => {
          user.addJoined(room, { through: { active: true }});
          res.status(200).json({ roomId: roomId });
        }).catch(err => {
          res.status(400).json({ error: err.message });
        });
      }
    }).catch(err => {
      res.status(400).json({ error: err.message });
    });
  }
});

// POST /rooms/leave/:id
router.post('/leave/:id', (req, res, next) => {
  const data = req.body;
  const roomId = req.params.id;
  if (!data.userId || !roomId || isNaN(parseInt(roomId)) || isNaN(parseInt(data.userId))) {
    res.status(400).json({ error: 'Invalid parameters! '});
  } else {
    Models.UserInRoom.find({
      where: {
        userId: data.userId,
        roomId: roomId
      }
    }).then(userInRoom => {
      if (userInRoom) {
        userInRoom.deactivate();
        res.status(200).json({ roomId: roomId});
      } else {
        res.status(400).json({ error: 'Relation not found!' });
      }
    }).catch(err => {
      res.status(400).json({ error: err.message });
    });
  }
});

// GET /rooms/in/:id

router.get('/in/:id', (req, res, next) => {
  const userId = req.params.id;
  if (!userId || isNaN(parseInt(userId))) {
    res.status(400).json({ error: 'UserId not valid!' });
  } else {
    Models.User.findById(userId).then(user => {
      if (user) {
        user.getJoined().then(rooms => {

          const validated = rooms.reduce((rooms, room) => {
            if (room.UserInRoom.active) {
              rooms.push(room);
            }
            return rooms;
          }, []);
          res.send(validated);
        }).catch(err => {
          res.status(400).json({ error: err.message });
        });
      } else {
        res.status(400).json({ error: 'User not found with given id!' });
      }
    }).catch(err => {
      res.status(400).json({ error: err.message });
    });
  }
});

module.exports = router;
