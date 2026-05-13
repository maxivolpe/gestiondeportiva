const classService = require('../services/classService');
const { success, paginated } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { disciplineId, profesorId, dia, page = 1, limit = 20 } = req.query;
    const result = await classService.getClasses({
      disciplineId,
      profesorId,
      dia,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    paginated(res, result.rows, {
      total: result.count,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { space_id, dia_semana, hora_inicio, hora_fin, cupos_maximos } = req.body;
    const clase = await classService.createClass({
      space_id,
      profesor_id: req.user.id,
      dia_semana,
      hora_inicio,
      hora_fin,
      cupos_maximos,
    });
    success(res, clase, 'Clase creada', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const clase = await classService.updateClass(req.params.id, req.body, req.user);
    success(res, clase, 'Clase actualizada');
  } catch (err) {
    next(err);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    const { error } = require('../utils/apiResponse');
    if (!fecha) return error(res, 'Parámetro fecha requerido', 400);
    const availability = await classService.getClassAvailability(req.params.id, fecha);
    success(res, availability);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, getAvailability };
