const { Attendance, Class, User, Space, Discipline } = require('../models');
const { success, error } = require('../utils/apiResponse');

const getByClass = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const { fecha } = req.query;

    if (req.user.rol === 'profesor') {
      const clase = await Class.findByPk(classId, {
        include: [{ model: Space, as: 'space' }],
      });
      if (!clase) return error(res, 'Clase no encontrada', 404);

      const professorClasses = await Class.findAll({
        where: { profesor_id: req.user.id },
        include: [{ model: Space, as: 'space' }],
      });
      const profDisciplineIds = [...new Set(professorClasses.map((c) => c.space?.discipline_id))];

      if (!profDisciplineIds.includes(clase.space?.discipline_id)) {
        return error(res, 'Sin permisos para ver esta clase', 403);
      }
    }

    const where = { class_id: classId };
    if (fecha) where.fecha = fecha;

    const attendances = await Attendance.findAll({
      where,
      include: [{ model: User, as: 'alumno', attributes: ['id', 'nombre', 'email'] }],
      order: [['fecha', 'DESC']],
    });
    success(res, attendances);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const { fecha, attendances: list } = req.body;

    if (!Array.isArray(list) || !fecha) {
      return error(res, 'Se requiere fecha y array de asistencias', 400);
    }

    const results = await Promise.all(
      list.map(async ({ alumno_id, presente, tipo = 'regular' }) => {
        const [attendance, created] = await Attendance.findOrCreate({
          where: { alumno_id, class_id: classId, fecha },
          defaults: { tipo, presente },
        });
        if (!created) await attendance.update({ presente });
        return attendance;
      })
    );

    success(res, results, 'Asistencia registrada');
  } catch (err) {
    next(err);
  }
};

module.exports = { getByClass, register };
