const request = require('supertest');
const app = require('../app');
const Models = require('../models');
const logger = require('../lib/logger');

const chars = 'abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789';
/**
 * Creating unique username for tests
 */
let user = {
  userName: '',
  firstName: 'Test',
  lastName: 'User',
  password: 'ADdsakd312',
  email: 'test@tt.tt'
};

let comparedUser = {
  userName: '',
  firstName: 'Another',
  lastName: 'User',
  password: '031faD023',
  email: 'an@ot.th'
};

function setNewUserName(user) {
  user.userName = '';
  for (let i = 0; i < 10; i++) {
    user.userName += chars.charAt(Math.floor(Math.random() * chars.length));
  }
}

let token = '';

beforeAll(() => {
  setNewUserName(user);
  setNewUserName(comparedUser);
  logger.init();
});

afterAll(() => {
  Models.sequelize.close();
});

describe('POST /api/users/register', () => {


  test('Should return 201 for new user', (done) => {
    request(app)
      .post('/api/users/register')
      .send(user)
      .expect(201)
      .then(response => {
        let copiedUser = Object.assign({}, user);
        delete copiedUser.password;
        expect(response.body).toMatchObject(copiedUser);
        user = Object.assign({}, user, {
          id: response.body.id
        });
        return done();
      });
  });

  test('Should return 201 for another new user', (done) => {
    request(app)
      .post('/api/users/register')
      .send(comparedUser)
      .expect(201)
      .then(response => {
        let copiedUser = Object.assign({}, comparedUser);
        delete copiedUser.password;
        expect(response.body).toMatchObject(copiedUser);
        return done();
      });
  });

  test('Should return 400 for trying to register the same user', (done) => {
    request(app)
      .post('/api/users/register')
      .send(Object.assign({}, user, {
        password: 'Asdkoaskd132'
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing userName property', (done) => {
    request(app)
      .post('/api/users/register')
      .send(Object.assign({}, user, {
        userName: null
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing email property', (done) => {
    request(app)
      .post('/api/users/register')
      .send(Object.assign({}, user, {
        email: null
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing password property', (done) => {
    request(app)
      .post('/api/users/register')
      .send(Object.assign({}, user, {
        password: null
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

});

describe('POST /api/users/login', () => {

  test('Should return 400 for missing userName', (done) => {
    request(app)
      .post('/api/users/login')
      .send(Object.assign({}, {
        password: user.password
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing password', (done) => {
    request(app)
      .post('/api/users/login')
      .send(Object.assign({}, {
        userName: user.userName
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for wrong userName', (done) => {
    request(app)
      .post('/api/users/login')
      .send(Object.assign({}, {
        userName: 'ASDasd123',
        password: user.password
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for wrong password', (done) => {
    request(app)
      .post('/api/users/login')
      .send(Object.assign({}, {
        userName: user.userName,
        password: 'Wrong123'
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 200 for correct credentials', (done) => {
    request(app)
      .post('/api/users/login')
      .send(user)
      .expect(200)
      .then((res) => {
        let copiedUser = Object.assign({}, user);
        delete copiedUser.password;
        expect(res.body).toMatchObject(copiedUser);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
        return done();
      });
  });
});

describe('GET /api/users/token', () => {

  test('Should return 401 for non-authorized request', (done) => {
    request(app)
      .get('/api/users/token')
      .expect(401)
      .end((err) => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 200 for authorized request', (done) => {
    request(app)
      .get('/api/users/token')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .then(response => {
        let copiedUser = Object.assign({}, user);
        delete copiedUser.password;
        expect(response.body).toMatchObject(copiedUser);
        return done();
      });

  });

});

describe('PUT /api/users/update', () => {

  test('Should return 401 for unauthorized request', (done) => {
    request(app)
      .put('/api/users/update')
      .send(comparedUser)
      .expect(401)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing userName property', (done) => {
    request(app)
      .put('/api/users/update')
      .set('Authorization', 'Bearer ' + token)
      .send(Object.assign({}, comparedUser, {
        userName: null
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 400 for missing userName', (done) => {
    request(app)
      .put('/api/users/update')
      .set('Authorization', 'Bearer ' + token)
      .send(Object.assign({}, user, {
        userName: null
      }))
      .expect(400)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 409 for conflicting userName', (done) => {
    request(app)
    .put('/api/users/update')
    .set('Authorization', 'Bearer ' + token)
    .send(Object.assign({}, user, {
      userName: comparedUser.userName
    }))
    .expect(409)
    .end(err => {
      if (err) return done.fail(err);
      return done();
    });
  });

  test('Should return 404 for falsy id', (done) => {
    let testUser = Object.assign({}, user, {
      id: -300
    });
    setNewUserName(testUser);
    request(app)
      .put('/api/users/update')
      .set('Authorization', 'Bearer ' + token)
      .send(testUser)
      .expect(404)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 200 for correct credentials', (done) => {
    setNewUserName(user);
    request(app)
      .put('/api/users/update')
      .set('Authorization', 'Bearer ' + token)
      .send(user)
      .expect(200)
      .then(res => {
        let copiedUser = Object.assign({}, user);
        delete copiedUser.password;
        expect(res.body).toMatchObject(copiedUser);
        return done();
      });
  });

});

describe('POST /api/users/logout', () => {

  test('Should return 401 for unauthorized request', (done) => {
    request(app)
      .post('/api/users/logout')
      .expect(401)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });

  test('Should return 200 for authorized request', (done) => {
    request(app)
      .post('/api/users/logout')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(err => {
        if (err) return done.fail(err);
        return done();
      });
  });
});
