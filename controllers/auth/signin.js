const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../../models/user');
const { HttpError } = require('../../helpers');

const { SECRET_KEY } = process.env;

const signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Invalid email or password');
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, 'Invalid email or password');
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

  res.status(200).json({
    token,
  });
};

module.exports = signIn;
