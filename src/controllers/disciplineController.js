const { Discipline, Space } = require('../models');
const { success, error } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const disciplines = await Discipline.findAll({
      where: { activo: true },
      include: [{ model: Space, as: 'spaces' }],
    });
    success(res, disciplines);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const discipline = await Discipline.create({ nombre, descripcion });
    success(res, discipline, 'Disciplina creada', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const discipline = await Discipline.findByPk(req.params.id);
    if (!discipline) return error(res, 'Disciplina no encontrada', 404);
    const { nombre, descripcion, activo } = req.body;
    await discipline.update({ nombre, descripcion, activo });
    success(res, discipline, 'Disciplina actualizada');
  } catch (err) {
    next(err);
  }
};

const getSpaces = async (req, res, next) => {
  try {
    const discipline = await Discipline.findByPk(req.params.id);
    if (!discipline) return error(res, 'Disciplina no encontrada', 404);
    const spaces = await Space.findAll({ where: { discipline_id: req.params.id } });
    success(res, spaces);
  } catch (err) {
    next(err);
  }
};

const createSpace = async (req, res, next) => {
  try {
    const discipline = await Discipline.findByPk(req.params.id);
    if (!discipline || !discipline.activo) return error(res, 'Disciplina no encontrada', 404);
    const { nombre, capacidad_maxima } = req.body;
    const space = await Space.create({ discipline_id: req.params.id, nombre, capacidad_maxima });
    success(res, space, 'Espacio creado', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, getSpaces, createSpace };
