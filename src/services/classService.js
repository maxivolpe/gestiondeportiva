const { Class, Space, Discipline, User, Enrollment, MakeupRequest } = require('../models');

const getClasses = async ({ disciplineId, profesorId, dia, page = 1, limit = 20 }) => {
  const where = { activo: true };
  if (dia) where.dia_semana = dia;
  if (profesorId) where.profesor_id = profesorId;

  const spaceWhere = {};
  if (disciplineId) spaceWhere.discipline_id = disciplineId;

  const { count, rows } = await Class.findAndCountAll({
    where,
    include: [
      {
        model: Space,
        as: 'space',
        where: Object.keys(spaceWhere).length ? spaceWhere : undefined,
        include: [{ model: Discipline, as: 'discipline' }],
      },
      { model: User, as: 'profesor', attributes: ['id', 'nombre', 'email'] },
    ],
    limit,
    offset: (page - 1) * limit,
    order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']],
  });

  return { rows, count, page, limit, pages: Math.ceil(count / limit) };
};

const getClassAvailability = async (classId, fecha) => {
  const clase = await Class.findByPk(classId);
  if (!clase || !clase.activo) {
    const err = new Error('Clase no encontrada');
    err.status = 404;
    throw err;
  }

  const regularCount = await Enrollment.count({
    where: { class_id: classId, activo: true },
  });

  const makeupCount = await MakeupRequest.count({
    where: { class_destino_id: classId, fecha_clase_destino: fecha, estado: 'aprobada' },
  });

  const ocupados = regularCount + makeupCount;
  return {
    class_id: classId,
    fecha,
    cupos_maximos: clase.cupos_maximos,
    cupos_ocupados: ocupados,
    cupos_disponibles: Math.max(0, clase.cupos_maximos - ocupados),
  };
};

const createClass = async ({ space_id, profesor_id, dia_semana, hora_inicio, hora_fin, cupos_maximos }) => {
  return Class.create({ space_id, profesor_id, dia_semana, hora_inicio, hora_fin, cupos_maximos });
};

const updateClass = async (classId, updates, requestingUser) => {
  const clase = await Class.findByPk(classId);
  if (!clase || !clase.activo) {
    const err = new Error('Clase no encontrada');
    err.status = 404;
    throw err;
  }

  if (requestingUser.rol === 'profesor' && clase.profesor_id !== requestingUser.id) {
    const err = new Error('Solo puedes editar tus propias clases');
    err.status = 403;
    throw err;
  }

  const allowed = ['dia_semana', 'hora_inicio', 'hora_fin', 'cupos_maximos', 'activo'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  await clase.update(filtered);
  return clase;
};

module.exports = { getClasses, getClassAvailability, createClass, updateClass };
