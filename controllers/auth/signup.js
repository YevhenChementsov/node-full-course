const { User } = require('../../models/user');

const signUp = async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
};

module.exports = signUp;
