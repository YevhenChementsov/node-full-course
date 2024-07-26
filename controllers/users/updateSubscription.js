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
    throw HttpError(404, 'Not found');
  }

  res.json(result);
};

module.exports = updateSubscription;
