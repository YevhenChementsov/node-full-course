const getAll = require('./getAll');
const getOne = require('./getById');
const add = require('./add');
const update = require('./updateById');
const updateFavorite = require('./updateFavorite');
const remove = require('./removeById');

module.exports = {
  getAll,
  getOne,
  add,
  update,
  updateFavorite,
  remove,
};
