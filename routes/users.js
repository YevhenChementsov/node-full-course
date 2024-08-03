const { Router } = require('express');

const { users: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { authenticate, validateBody, upload } = require('../middlewares');
const { schemas } = require('../models/user');

const router = Router();

router.get('/current', authenticate, ctrlWrapper(ctrl.getCurrentUser));

router.patch(
  '/subscription',
  authenticate,
  validateBody(schemas.updateUserSubscriptionSchema),
  ctrlWrapper(ctrl.updateSubscription),
);

router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  ctrlWrapper(ctrl.updateAvatar),
);

module.exports = router;
