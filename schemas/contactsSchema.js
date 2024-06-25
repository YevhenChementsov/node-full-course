const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
  phone: Joi.string()
    .pattern(new RegExp('^\\(\\d{3}\\) \\d{3}-\\d{4}$'))
    .required(),
});

module.exports = schema;
