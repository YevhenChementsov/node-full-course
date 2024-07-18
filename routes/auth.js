const { Router } = require('express');

const { auth: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { validateBody } = require('../middlewares');
const { schemas } = require('../models/user');

const router = Router();

router.post(
  '/signup',
  validateBody(schemas.signUpSchema),
  ctrlWrapper(ctrl.signUp),
);

module.exports = router;
