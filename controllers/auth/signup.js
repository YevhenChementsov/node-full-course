const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const { nanoid } = require('nanoid');
require('dotenv').config();

const { User } = require('../../models/user');
const { HttpError, sendEmail } = require('../../helpers');

const { BASE_URL } = process.env;

const signUp = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, 'User with this email already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a href="${BASE_URL}/api/auth/verify/${verificationToken}" target="_blank" rel="noreferrer noopener" aria-label="Email verification link">Click verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    status: 'success',
    code: 201,
    user: {
      name: newUser.name,
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

module.exports = signUp;
