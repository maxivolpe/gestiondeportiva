const bcrypt = require('bcrypt');
const { User } = require('../models');
const { success, paginated, error } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, rol } = req.query;
    const where = { activo: true };
    if (rol) where.rol = rol;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['nombre', 'ASC']],
    });

    paginated(res, rows, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user || !user.activo) return error(res, 'Usuario no encontrado', 404);
    success(res, user);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ nombre, email, password_hash, rol });
    const userData = user.toJSON();
    delete userData.password_hash;
    success(res, userData, 'Usuario creado', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || !user.activo) return error(res, 'Usuario no encontrado', 404);

    const allowed = ['nombre', 'email', 'rol'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    if (req.body.password) {
      updates.password_hash = await bcrypt.hash(req.body.password, 12);
    }

    await user.update(updates);
    const userData = user.toJSON();
    delete userData.password_hash;
    success(res, userData, 'Usuario actualizado');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || !user.activo) return error(res, 'Usuario no encontrado', 404);
    await user.update({ activo: false });
    success(res, null, 'Usuario desactivado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
