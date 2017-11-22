const request = require('supertest');
const app = require('../app');
const Models = require('../models');
const chars = 'abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789';


afterAll(() => {
  Models.sequelize.close();
});


/**
 * Creating unique username for tests
 */
let user = {
  userName: '',
  firstName: 'Test',
  lastName: 'User',
  password: 'ADdsakd312',
  email: 'test@tt.t'
};
let roomOne = {
  roomName: ''
};
let roomTwo = {
  roomName: '',
  password: ''
};
let token = '';

/**
 * Set a random string for object's given property
 * @param {Object} obj an object to mutate
 * @param {String} property the property of given object that you want to set
 * as random string
 */
function setRandomStringForProperty(obj, property) {
  if (!obj.hasOwnProperty(property)) {
    throw new Error('Given object should have property ' + property + ' but it does not!');
    return;
  }
  for (let i = 0; i < 10; i++) {
    obj[property] += chars.charAt(Math.floor(Math.random() * chars.length));
  }
}

beforeAll(() => {
  setRandomStringForProperty(user, 'userName');
  setRandomStringForProperty(roomOne, 'roomName');
  setRandomStringForProperty(roomTwo, 'roomName');
  setRandomStringForProperty(roomTwo, 'password');
});

describe('POST /api/rooms/new', () => {
  test('Creating user for tests', (done) => {
    request(app)
      .post('/api/users/register')
      .send(user)
      .expect(201)
      .then(res => {
        let copiedObject = Object.assign({}, user);
        delete copiedObject.password;
        expect(res.body).toMatchObject(copiedObject);
        user = Object.assign({}, user, res.body);
        return done();
      });
  });

  test('Loggin user in for tests', (done) => {
    request(app)
      .post('/api/users/login')
      .send(user)
      .expect(200)
      .then(res => {
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
        return done();
      });
  });

  test('Should return 401 for unauthorized request', (done) => {
    request(app)
      .post('/api/rooms/new')
      .expect(401)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing roomName property', (done) => {
    request(app)
      .post('/api/rooms/new')
      .set('Authorization', 'Bearer ' + token)
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing userId property', (done) => {
    request(app)
      .post('/api/rooms/new')
      .send(roomOne)
      .set('Authorization', 'Bearer ' + token)
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for falsy userId property', (done) => {
    request(app)
      .post('/api/rooms/new')
      .send(Object.assign({}, roomOne, {
        userId: 'ad32'
      }))
      .set('Authorization', 'Bearer ' + token)
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        roomOne = Object.assign({}, roomOne, {
          userId: user.id
        });
        roomTwo = Object.assign({}, roomTwo, {
          userId: user.id
        });
        return done();
      });
  });

  test('Should return 201 with correct credentials without password', (done) => {
    request(app)
      .post('/api/rooms/new')
      .send(roomOne)
      .set('Authorization', 'Bearer ' + token)
      .expect(201)
      .then(res => {
        expect(res.body).toMatchObject(roomOne);
        expect(res.body).not.toHaveProperty('password');
        roomOne = Object.assign({}, res.body);
        return done();
      });
  });

  test('Should return 201 with correct credentials with password', (done) => {
    request(app)
      .post('/api/rooms/new')
      .send(roomTwo)
      .set('Authorization', 'Bearer ' + token)
      .expect(201)
      .then(res => {
        let roomWithoutPass = Object.assign({}, roomTwo);
        delete roomWithoutPass.password;
        expect(res.body).toMatchObject(roomWithoutPass);
        expect(res.body).not.toHaveProperty('password');
        roomTwo = Object.assign({}, res.body, roomTwo);
        return done();
      });
  });

  test('Should return 409 with conflicting roomName', (done) => {
    request(app)
      .post('/api/rooms/new')
      .send(roomOne)
      .set('Authorization', 'Bearer ' + token)
      .expect(409)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });
});
