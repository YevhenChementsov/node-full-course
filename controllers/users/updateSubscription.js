const { User } = require('../../models/user');
const { HttpError } = require('../../helpers');

const updateSubscription = async (req, res) => {
  const { id } = req.params;
  const { subscription } = req.body;
  const result = await User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true },
  );
  if (!result) {
    throw HttpError(404, 'User not found');
  }

  res.json({
    status: 'success',
    code: 200,
    user: result,
  });
};

module.exports = updateSubscription;
