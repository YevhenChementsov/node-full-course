const express = require('express');

const ctrl = require('../controllers/contactsControllers.js');
const { validateBody } = require('../helpers');
const schema = require('../schemas/contactsSchema.js');

const contactsRouter = express.Router();

contactsRouter.get('/', ctrl.getAllContacts);

contactsRouter.get('/:id', ctrl.getOneContact);

contactsRouter.post('/', validateBody(schema), ctrl.createContact);

contactsRouter.put('/:id', validateBody(schema), ctrl.updateContact);

contactsRouter.delete('/:id', ctrl.deleteContact);

module.exports = contactsRouter;
