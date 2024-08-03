const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');

const { User } = require('../../models/user');

const avatarsDir = path.join(__dirname, '../', '../', 'public', 'avatars');

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  // Reading and resizing an image
  const image = await Jimp.read(tempUpload);
  await image.cover(250, 250).writeAsync(resultUpload);

  // Delete temporary file
  await fs.unlink(tempUpload);

  const avatarURL = path.join('avatars', filename);

  // Update avatar URL in the database
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    status: 'success',
    code: 200,
    avatarURL,
  });
};

module.exports = updateAvatar;
