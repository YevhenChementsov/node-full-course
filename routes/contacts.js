const { Router } = require('express');

const { contacts: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { validateBody, isValidId, authenticate } = require('../middlewares');
const { schemas } = require('../models/contact');

const router = Router();

router.get('/', authenticate, ctrlWrapper(ctrl.getAll));

router.get('/:id', authenticate, isValidId, ctrlWrapper(ctrl.getOne));

router.post(
  '/',
  authenticate,
  validateBody(schemas.addSchema),
  ctrlWrapper(ctrl.add),
);

router.put(
  '/:id',
  authenticate,
  isValidId,
  validateBody(schemas.addSchema),
  ctrlWrapper(ctrl.update),
);

router.patch(
  '/:id/favorite',
  authenticate,
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrlWrapper(ctrl.updateFavorite),
);

router.delete('/:id', authenticate, isValidId, ctrlWrapper(ctrl.remove));

module.exports = router;
