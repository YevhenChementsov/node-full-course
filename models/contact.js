const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../helpers');

//* Regular expression for name
const nameRegExp = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/;
//* Regular expression for phone
const phoneRegExp =
  /^\+?\d{0,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

//* Mongoose DB validation schema
const contactSchema = new Schema(
  {
    name: {
      type: String,
      match: nameRegExp,
      required: [true, 'Name is a required field'],
    },
    email: {
      type: String,
      required: [true, 'Email is a required field'],
    },
    phone: {
      type: String,
      match: phoneRegExp,
      required: [true, 'Phone is a required field'],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true },
);

contactSchema.post('save', handleMongooseError);

//* Joi validation
const addSchema = Joi.object({
  name: Joi.string().pattern(nameRegExp).min(3).max(30).required().messages({
    'string.base': 'Name should be a string',
    'string.pattern.base': 'Name should be a string',
    'string.empty': 'Name cannot be an empty field',
    'string.min': 'Name should have a minimum of {#limit} letters',
    'string.max': 'Name should have a maximum of {#limit} letters',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email cannot be an empty field',
      'any.required': 'Email is a required field',
    }),
  phone: Joi.string().pattern(phoneRegExp).required().messages({
    'string.pattern.base': 'Phone number must be in the format (012) 345-67-89',
    'string.empty': 'Phone number cannot be an empty field',
    'any.required': 'Phone number is a required field',
  }),
  favorite: Joi.bool(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.bool().required(),
});

const schemas = {
  addSchema,
  updateFavoriteSchema,
};

const Contact = model('contact', contactSchema);

module.exports = {
  Contact,
  schemas,
};
