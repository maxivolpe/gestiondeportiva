const { Enrollment, Class, User } = require('../models');
const { success, paginated, error } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const where = { activo: true };
    if (req.user.rol === 'alumno') where.alumno_id = req.user.id;

    const { page = 1, limit = 20 } = req.query;
    const { count, rows } = await Enrollment.findAndCountAll({
      where,
      include: [
        { model: User, as: 'alumno', attributes: ['id', 'nombre', 'email'] },
        { model: Class, as: 'clase' },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
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

const create = async (req, res, next) => {
  try {
    const { alumno_id, class_id, fecha_desde } = req.body;
    const enrollment = await Enrollment.create({ alumno_id, class_id, fecha_desde });
    success(res, enrollment, 'Inscripción creada', 201);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment || !enrollment.activo) return error(res, 'Inscripción no encontrada', 404);
    await enrollment.update({ activo: false });
    success(res, null, 'Inscripción dada de baja');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, remove };
