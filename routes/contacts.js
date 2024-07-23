const { Router } = require('express');

const { contacts: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { validateBody, isValidId, authenticate } = require('../middlewares');
const { schemas } = require('../models/contact');

const contactsRouter = Router();

contactsRouter.get('/', authenticate, ctrlWrapper(ctrl.getAll));

contactsRouter.get('/:id', authenticate, isValidId, ctrlWrapper(ctrl.getOne));

contactsRouter.post(
  '/',
  authenticate,
  validateBody(schemas.addSchema),
  ctrlWrapper(ctrl.add),
);

contactsRouter.put(
  '/:id',
  authenticate,
  isValidId,
  validateBody(schemas.addSchema),
  ctrlWrapper(ctrl.update),
);

contactsRouter.patch(
  '/:id/favorite',
  authenticate,
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrlWrapper(ctrl.updateFavorite),
);

contactsRouter.delete(
  '/:id',
  authenticate,
  isValidId,
  ctrlWrapper(ctrl.remove),
);

module.exports = contactsRouter;
