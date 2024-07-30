const { Contact } = require('../../models/contact');
const { HttpError } = require('../../helpers');

const updateById = async (req, res) => {
  const { id } = req.params;
  const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    throw HttpError(404, 'User not found');
  }

  res.json({
    status: 'success',
    code: 200,
    contact: result,
  });
};

module.exports = updateById;
