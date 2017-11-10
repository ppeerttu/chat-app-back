const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Models = require('../models');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

// POST /users/login
router.post('/login', (req, res, next) => {
  const data = req.body;
  if (!data.userName || !data.password) {
    console.log(data);
    res.sendStatus(400);
  } else {
    Models.User.findOne({
      where: {
        userName: data.userName,
        password: data.password
      }
    }).then(user => {
      if (!user) {
        res.status(400).json({ error: 'User not found! '});
      } else {
        user = Object.assign({}, user.dataValues);
        const token = jwt.sign({ userName: user.userName }, 'testy secret 5', {
          expiresIn: '1h'
        });
        let userWithToken = Object.assign({}, user, {token});
        delete userWithToken.password;
        res.status(200).json(userWithToken);
      }
    }).catch(err => {
      res.status(400).json({ error: err.message });
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
      }
    });
  } else {
    res.send(400);
  }
});

// POST /users/register
router.post('/register', (req, res, next) => {
  const data = req.body;
  console.log(data);
  if (!data.userName || !data.email || !data.password) {
    res.status(400).json({ error: 'Invalid parameters!'});
  } else {
    Models.User.find({
      where: {
        userName: data.userName
      }
    }).then(user => {
      if (!user) {
        Models.User.create(data).then(user => {
          delete user.dataValues.password;  // user is a promise object
          res.send(user);
        }).catch(err => {
          res.status(400).json({ error: err.message });
        });
      } else {
        res.status(400).json({ error: 'Username already in use!' });
      }
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
      Models.User.update(data, {
        where: {
          id: data.id
        },
        returning: true
      }).then(updated => {
        if (updated[0] > 0) {
          let updatedUser = updated[1][0];
          delete updatedUser.dataValues.password;
          res.status(200).json(updatedUser);
        } else {
          res.status(400).json({ error: 'Requested user for update was not found!' });
        }
      });
    } else {
      res.status(400).json({ error: 'Username already in use!'});
    }
  });
});

// POST /users/logout
router.post('/logout', (req, res, next) => {
  res.status(200).json({});
});

module.exports = router;
