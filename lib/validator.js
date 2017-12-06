
/**
 * @class Validator
 * Used in routes to validate user input via HTTP requests
 * Static methods only
 */
module.exports = class Validator {

  static validateUserName(userName) {
    if (
      !userName
      || typeof userName !== 'string'
      || userName.length < 3
      || userName.length > 15
    ) return false;
    return true;
  };

  static validateEmail(email) {
    const emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (
      !email
      || typeof email !== 'string'
      || !emailRe.test(email)
      || email.length > 15
    ) return false;
    return true;
  };

  static validateUserPassword(password) {
    if (
      !password
      || typeof password !== 'string'
      || password.length < 6
      || password.length > 20
    ) return false;
    return true;
  };

  static validateRoomName(roomName) {
    if (
      !roomName
      || typeof roomName !== 'string'
      || roomName.length > 15
    ) return false;
    return true;
  }

  static validateRoomPassword(roomPassword) {
    if (
      roomPassword === null
      || roomPassword === 'null'
    ) return true;
    if (
      !roomPassword
      || typeof roomPassword !== 'string'
      || roomPassword.length > 20
    ) return false;
    return true;
  }

  static validateId(id) {
    if (isNaN(parseInt(id))) return false;
    return true;
  }
};
