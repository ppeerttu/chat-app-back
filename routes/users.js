const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const Models = require('../models');
const Logger = require('../lib/logger');
const logger = new Logger();


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
        return new Promise((resolve, reject) => { reject({ status: 400, message: 'User not found!' }); });
      } else {
        return bcrypt.compare(data.password, user.password).then(matches => {
          return [matches, user];
        });
      }
    })
    .then(values => {
      const matches = values[0];
      let user = values[1];
      if (matches) {
        user = Object.assign({}, user.dataValues);
        const token = jwt.sign({ userName: user.userName }, 'testy secret 5', {
          expiresIn: '1h'
        });
        let userWithToken = Object.assign({}, user, {token});
        delete userWithToken.password;
        res.status(200).json(userWithToken);
      } else {
        return new Promise((resolve, reject) => { reject({ status: 400, message: 'Wrong username or password!' }); });
      }
    })
    .catch(err => {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
      logger.add('error', 'Error occurred while logging user in: ' + err.message);
    });
  }
});

// GET /user/token

router.get('/token', (req, res, next) => {
  if (req.user) {
    Models.User.find({ where: {
      userName: req.user.userName
    }})
    .then(user => {
      if (user) {
        user = Object.assign({}, user.dataValues);
        const token = jwt.sign({ userName: user.userName }, 'testy secret 5', {
          expiresIn: '1h'
        });
        let userWithToken = Object.assign({}, user, {token});
        delete userWithToken.password;
        res.status(200).json(userWithToken);
      } else {
        return new Promise((resolve, reject) => { reject({ status: 400, message: 'User not found!' }); });
      }
    })
    .catch(err => {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
      logger.add('error', 'Error occurred while fetching API token: ' + err.message);
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
    })
    .then(user => {
      if (!user) {
        return bcrypt.hash(data.password, saltRounds);
      } else {
        return new Promise((resolve, reject) => { reject({ status: 400, message: 'Username already taken!' }); });
      }
    })
    .then(hash => {
      data = Object.assign({}, data, {
        password: hash
      });
      return Models.User.create(data);
    }).then(user => {
      delete user.dataValues.password;  // user is a promise object
      res.status(201).json(user);
    })
    .catch(err => {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
      logger.add('error', 'Error occurred while creating user: ' + err.message);
    });
  }
});

// put /users/update
router.put('/update', (req, res, next) => {
  const data = req.body;
  if (data.password === null || data.password === '') {
    delete data.password;
  }
  if (!data.userName) {
    res.status(400).json({ error: 'Request did not contain userName! '});
  } else {
    Models.User.find({
      where: {
        userName: data.userName
      }
    }).then(user => {
      if (!user || user.id === data.id) {
        return bcrypt.hash(data.password, saltRounds);
      } else {
        return new Promise((resolve, reject) => { reject({ status: 409, message: 'Username already in use!'}); });
      }
    })
    .then(hash => {
      const dataWithHash = Object.assign({}, data, {
        password: hash
      });
      return Models.User.update(dataWithHash, {
        where: {
          id: dataWithHash.id
        },
        returning: true
      });
    })
    .then(updated => {
      if (updated[0] > 0) {
        let updatedUser = updated[1][0];
        delete updatedUser.dataValues.password;
        res.status(200).json(updatedUser);
      } else {
        return new Promise((resolve, reject) => { reject({ status: 404, message: 'Requested user for update was not found!'}); });
      }
    }).catch(err => {
      if (err.status) {
        // Catch handled errors
        res.status(err.status).json({ error: err.message });
      } else {
        // Catch unhandled errors (sequelize errors)
        res.status(500).json({ error: err.message });
      }
      logger.add('error', 'Error occurred while updating user: ' + err.message);
    });
  }

});

// POST /users/logout
router.post('/logout', (req, res, next) => {
  res.status(200).json({});
});

module.exports = router;
