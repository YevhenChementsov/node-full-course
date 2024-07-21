const bcrypt = require('bcrypt');

const { User } = require('../../models/user');
const { HttpError } = require('../../helpers');

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
  const token = 'd08gdfas0fas/+09df8dsa09fasd09645*.fads0f87a';

  res.json({
    token,
  });
};

module.exports = signIn;
