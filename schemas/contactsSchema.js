const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string()
    .pattern(new RegExp('^(?! )[a-zA-Zа-яА-Я ]*(?<! )$'))
    .min(3)
    .max(30)
    .required()
    .messages({
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
  phone: Joi.string()
    .pattern(new RegExp('^\\(\\d{3}\\) \\d{3}-\\d{4}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Phone number must be in the format (123) 456-7890',
      'string.empty': 'Phone number cannot be an empty field',
      'any.required': 'Phone number is a required field',
    }),
});

module.exports = schema;
