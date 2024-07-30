const { Contact } = require('../../models/contact');
const { HttpError } = require('../../helpers');

const removeById = async (req, res) => {
  const { id } = req.params;
  const result = await Contact.findByIdAndDelete(id);
  if (!result) {
    throw HttpError(404, 'User not found');
  }

  res.json({
    status: 'success',
    code: 200,
    message: 'Deleted successfully',
  });
};

module.exports = removeById;
