const bcrypt = require('bcrypt');
const gravatar = require('gravatar');

const { User } = require('../../models/user');
const { HttpError } = require('../../helpers');

const signUp = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, 'User with this email already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
  });

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
