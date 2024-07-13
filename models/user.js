const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError, regexp } = require('../helpers');

const userSchema = new Schema(
  {
    password: {
      type: String,
      minlength: [
        6,
        'The value is shorter than the minimum allowed length ({MINLENGTH}).',
      ],
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      match: regexp.emailRegExp,
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true },
);

userSchema.post('save', handleMongooseError);

const User = model('user', userSchema);

module.exports = User;
