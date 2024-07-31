const getCurrentUser = async (req, res) => {
  const { name, subscription } = req.user;

  res.json({
    status: 'success',
    code: 200,
    user: {
      name,
      subscription,
    },
  });
};

module.exports = getCurrentUser;
