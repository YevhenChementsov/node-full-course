const express = require('express');

const { contacts: ctrl } = require('../controllers');
const { ctrlWrapper } = require('../helpers');
const { validateBody, isValidId } = require('../middlewares');
const { schemas } = require('../models/contact');

const contactsRouter = express.Router();

contactsRouter.get('/', ctrlWrapper(ctrl.getAll));

contactsRouter.get('/:id', isValidId, ctrlWrapper(ctrl.getOne));

contactsRouter.post(
  '/',
  validateBody(schemas.addSchema),
  ctrlWrapper(ctrl.add),
);

contactsRouter.put(
  '/:id',
  isValidId,
  validateBody(schemas.addSchema),
  ctrlWrapper(ctrl.update),
);

contactsRouter.patch(
  '/:id/favorite',
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrlWrapper(ctrl.updateFavorite),
);

contactsRouter.delete('/:id', isValidId, ctrlWrapper(ctrl.remove));

module.exports = contactsRouter;
