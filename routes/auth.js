const { Router } = require('express');

const { auth: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { validateBody, authenticate } = require('../middlewares');
const { schemas } = require('../models/user');

const router = Router();

router.post(
  '/signup',
  validateBody(schemas.signUpSchema),
  ctrlWrapper(ctrl.signUp),
);

router.get('/verify/:verificationToken', ctrlWrapper(ctrl.verifyEmail));

router.post(
  '/signin',
  validateBody(schemas.signInSchema),
  ctrlWrapper(ctrl.signIn),
);

router.get('/signout', authenticate, ctrlWrapper(ctrl.signOut));

module.exports = router;
