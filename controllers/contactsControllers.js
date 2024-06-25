const Joi = require("joi");

const services = require("../services/contactsServices");
const HttpError = require("../helpers");

const schema = Joi.object({
	name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required()
})

const getAllContacts = async(req, res, next) => {
	try {
		const result = await services.getListOfContacts();

		res.json(result);
	} catch (error) {
		next(error);
	}
};

const getOneContact = async(req, res, next) => {
	try {
		const { id } = req.params;
		const result = await services.getContactById(id);
		if(!result) {
			throw HttpError(404, "Not found");
		}

		res.json(result);
	} catch (error) {
		next(error);
	}
};

const createContact = async(req, res, next) => {
	try {
		const { error } = schema.validate(req.body);
		if (error) {
			throw HttpError(400, error.message)
		}
		const result = await services.addContact(req.body);
		
		res.status(201).json(result);
	} catch (error) {
		next(error);
	}
};

const updateContact = async(req, res, next) => {
	try {
		const { error } = schema.validate(req.body);
		if (error) {
			throw HttpError(400, error.message)
		}
		const { id } = req.params;
		const result = await services.updateContactById(id, req.body);
		if(!result) {
			throw HttpError(404, "Not found");
		}

		res.json(result);
	} catch (error) {
		next(error);
	}
};

const deleteContact = async(req, res, next) => {
	try {
		const { id } = req.params;
		const result = await services.deleteContact(id);
		if(!result) {
			throw HttpError(404, "Not found");
		}

		// res.status(204).send();
		res.json({
			message: "Deleted successfully"
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getAllContacts,
	getOneContact,
	createContact,
	updateContact,
	deleteContact
}