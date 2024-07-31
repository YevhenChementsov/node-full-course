const { Router } = require('express');

const { users: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { authenticate, isValidId, validateBody } = require('../middlewares');
const { schemas } = require('../models/user');

const router = Router();

router.get('/current', authenticate, ctrlWrapper(ctrl.getCurrentUser));

router.patch(
  '/:id/subscription',
  authenticate,
  isValidId,
  validateBody(schemas.updateUserSubscriptionSchema),
  ctrlWrapper(ctrl.updateSubscription),
);

module.exports = router;
