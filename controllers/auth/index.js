const signIn = require('./signin');
const signUp = require('./signup');
const signOut = require('./signout');
const verifyEmail = require('./verifyEmail');
const resendVerifyEmail = require('./resendVerifyEmail');

module.exports = {
  signIn,
  signUp,
  signOut,
  verifyEmail,
  resendVerifyEmail,
};
