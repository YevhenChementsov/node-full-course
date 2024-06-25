const services = require('../services/contactsServices');
const { HttpError, ctrlWrapper } = require('../helpers');

const getAllContacts = async (_, res) => {
  const result = await services.getListOfContacts();

  res.json(result);
};

const getOneContact = async (req, res) => {
  const { id } = req.params;
  const result = await services.getContactById(id);
  if (!result) {
    throw HttpError(404, 'Not found');
  }

  res.json(result);
};

const createContact = async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const result = await services.addContact(req.body);

  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { id } = req.params;
  const result = await services.updateContactById(id, req.body);
  if (!result) {
    throw HttpError(404, 'Not found');
  }

  res.json(result);
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  const result = await services.deleteContact(id);
  if (!result) {
    throw HttpError(404, 'Not found');
  }

  // res.status(204).send();
  res.json({
    message: 'Deleted successfully',
  });
};

module.exports = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  deleteContact: ctrlWrapper(deleteContact),
};
