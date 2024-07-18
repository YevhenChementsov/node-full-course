const { HttpError } = require('../../helpers');
const { User } = require('../../models/user');

const signUp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (email) {
    throw HttpError(409, 'User with this email already exists');
  }

  const newUser = await User.create(req.body);

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
};

module.exports = signUp;
