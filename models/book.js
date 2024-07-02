const { Schema, model } = require('mongoose');

const contactSchema = new Schema(
  {
    name: {
      type: String,
      match: /^(?! )[a-zA-Zа-яА-Я ]*(?<! )$/,
      required: [true, 'Name is a required field'],
    },
    email: {
      type: String,
      required: [true, 'Email is a required field'],
    },
    phone: {
      type: String,
      match: /^\\(\\d{3}\\) \\d{3}-\\d{4}$/,
      required: [true, 'Phone is a required field'],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true },
);

const Contact = model('contact', contactSchema);

module.exports = Contact;
