const { User } = require('../../models/user');
const { HttpError } = require('../../helpers');

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    const userAlreadyVerified = await User.findOne({
      verificationToken: null,
      verify: true,
    });
    if (userAlreadyVerified) {
      throw HttpError(400, 'Verification has already been passed');
    } else {
      throw HttpError(404, 'User not found');
    }
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.status(200).json({
    status: 'success',
    code: 200,
    message: 'Verification successful',
  });
};

module.exports = verifyEmail;
