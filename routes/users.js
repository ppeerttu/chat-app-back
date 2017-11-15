const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const Models = require('../models');
const Logger = require('../lib/logger');
const logger = new Logger();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

// POST /users/login
router.post('/login', (req, res, next) => {
  const data = req.body;
  if (!data.userName || !data.password) {
    res.status(400).json({ error: 'userName or password missing from request! '});
    logger.add('warn', 'Error occurred while logging user in: missing properties userName or password');
  } else {
    Models.User.findOne({
      where: {
        userName: data.userName
      }
    }).then(user => {
      if (!user) {
        res.status(400).json({ error: 'User not found! '});
        logger.add('warn', 'Error occurred while logging user in: user not found');
      } else {
        bcrypt.compare(data.password, user.password).then(matches => {
          if (matches) {
            user = Object.assign({}, user.dataValues);
            const token = jwt.sign({ userName: user.userName }, 'testy secret 5', {
              expiresIn: '1h'
            });
            let userWithToken = Object.assign({}, user, {token});
            delete userWithToken.password;
            res.status(200).json(userWithToken);
          } else {
            res.status(400).json({ error: 'Wrong username or password!' });
            logger.add('warn', 'Error occurred while logging user in: wrong password');
          }
        }).catch(err => {
          res.status(500).json({ error: 'Error occurred while operating with hash functions' });
          logger.add('error', 'Error occurred while operating with bcrypt comparing functions: ' + err.message);
        });
      }
    }).catch(err => {
      res.status(500).json({ error: err.message });
      logger.add('error', 'Error occurred while logging user in: ' + err.message);
    });
  }
});

// GET /user/token

router.get('/token', (req, res, next) => {
  if (req.user) {
    Models.User.find({ where: {
      userName: req.user.userName
    }}).then(user => {
      if (user) {
        user = Object.assign({}, user.dataValues);
        const token = jwt.sign({ userName: user.userName }, 'testy secret 5', {
          expiresIn: '1h'
        });
        let userWithToken = Object.assign({}, user, {token});
        delete userWithToken.password;
        res.status(200).json(userWithToken);
      } else {
        res.status(400).json({ error: 'User not found!' });
        logger.add('warn', 'User not found');
      }
    });
  } else {
    res.status(400).json({ error: 'Request missing property user' });
    logger.add('warn', 'Request missing property user');
  }
});

// POST /users/register
router.post('/register', (req, res, next) => {
  let data = req.body;
  if (!data.userName || !data.email || !data.password) {
    res.status(400).json({ error: 'Invalid parameters!'});
    logger.add('warn', 'Invalid parameters!');
  } else {
    Models.User.find({
      where: {
        userName: data.userName
      }
    }).then(user => {
      if (!user) {
        bcrypt.hash(data.password, saltRounds).then(hash => {
          data = Object.assign({}, data, {
            password: hash
          });
          return Models.User.create(data);
        }).then(user => {
          delete user.dataValues.password;  // user is a promise object
          res.send(user);
        }).catch(err => {
          res.status(400).json({ error: err.message });
          logger.add('error', 'Error occurred while creating a new user: ' + err.message);
        });
      } else {
        res.status(400).json({ error: 'Username already in use!' });
        logger.add('warn', 'Username already in use!');
      }
    }).catch(err => {
      res.status(400).json({ error: 'Error occurred: ' + err.message });
    });
  }
});

// put /users/update
router.put('/update', (req, res, next) => {
  const data = req.body;
  if (data.password === null || data.password === '') {
    delete data.password;
  }
  Models.User.find({
    where: {
      userName: data.userName
    }
  }).then(user => {
    if (!user || user.id === data.id) {
      const hash = bcrypt.hashSync(data.password, saltRounds);
      const dataWithHash = Object.assign({}, data, {
        password: hash
      });
      Models.User.update(dataWithHash, {
        where: {
          id: dataWithHash.id
        },
        returning: true
      }).then(updated => {
        if (updated[0] > 0) {
          let updatedUser = updated[1][0];
          delete updatedUser.dataValues.password;
          res.status(200).json(updatedUser);
        } else {
          res.status(400).json({ error: 'Requested user for update was not found!' });
          logger.add('warn', 'Requested user for update was not found!');
        }
      }).catch(err => {
        res.send(400).json({ error: 'Error occurred while updating user: ' + err.message });
        logger.add('error', 'Error occurred while updating user: ' + err.message);
      });
    } else {
      res.status(409).json({ error: 'Username already in use!'});
      logger.add('warn', 'Username already in use!');
    }
  }).catch(err => {
    res.status(400).json({ error: 'Error occurred while finding the user: ' + err.message});
    logger.add('error', 'Error occurred while finding the user: ' + err.message);
  });
});

// POST /users/logout
router.post('/logout', (req, res, next) => {
  res.status(200).json({});
});

module.exports = router;
