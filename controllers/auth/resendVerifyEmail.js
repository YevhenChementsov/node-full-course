require('dotenv').config();

const { User } = require('../../models/user');
const { HttpError, sendEmail } = require('../../helpers');

const { BASE_URL } = process.env;

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, 'User not found');
  }
  if (user.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a href="${BASE_URL}/api/auth/verify/${user.verificationToken}" target="_blank" rel="noreferrer noopener" aria-label="Email verification link">Click verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({
    status: 'success',
    code: 200,
    message: 'The email verification link has been re-sent to your mailbox',
  });
};

module.exports = resendVerifyEmail;
