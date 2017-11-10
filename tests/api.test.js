const request = require('supertest');
const app = require('../app');

describe('API test for index', () => {

  test('Should give unauthorized for GET /api', (done) => {
    request(app)
      .get('/api')
      .expect(401)
      .end((err) => {
        if (err) return done.fail(err);
        return done();
      });
  });
});
