'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const now = new Date().toUTCString();
    return queryInterface.bulkInsert('Users', [{
      userName: 'TestUser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@email.tt',
      password: 'Sample1234',
      createdAt: now,
      updatedAt: now
    },
    {
      userName: 'JohnDoe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.tt',
      password: 'Sample1234',
      createdAt: now,
      updatedAt: now
    }], {});
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.bulkDelete('Users', null, {});

  }
};
