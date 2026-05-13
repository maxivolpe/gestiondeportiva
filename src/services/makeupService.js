const { Op } = require('sequelize');
const { sequelize, MakeupRequest, Enrollment, Attendance, Class } = require('../models');

const approveMakeupRequest = async (makeupRequestId, secretarioId) => {
  const transaction = await sequelize.transaction({ isolationLevel: 'SERIALIZABLE' });

  try {
    const makeup = await MakeupRequest.findByPk(makeupRequestId, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!makeup) {
      const err = new Error('Solicitud no encontrada');
      err.status = 404;
      throw err;
    }

    if (makeup.estado !== 'pendiente') {
      const err = new Error('Solicitud ya procesada');
      err.status = 409;
      throw err;
    }

    const targetClass = await Class.findByPk(makeup.class_destino_id, { transaction });

    const regularCount = await Enrollment.count({
      where: { class_id: makeup.class_destino_id, activo: true },
      transaction,
    });

    const makeupCount = await MakeupRequest.count({
      where: {
        class_destino_id: makeup.class_destino_id,
        fecha_clase_destino: makeup.fecha_clase_destino,
        estado: 'aprobada',
        id: { [Op.ne]: makeupRequestId },
      },
      transaction,
    });

    if (regularCount + makeupCount >= targetClass.cupos_maximos) {
      const err = new Error('Sin cupos disponibles');
      err.status = 409;
      throw err;
    }

    await makeup.update({ estado: 'aprobada', aprobado_por: secretarioId }, { transaction });

    await Attendance.create(
      {
        alumno_id: makeup.alumno_id,
        class_id: makeup.class_destino_id,
        fecha: makeup.fecha_clase_destino,
        tipo: 'recupero',
        presente: false,
      },
      { transaction }
    );

    await transaction.commit();
    return makeup;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const rejectMakeupRequest = async (makeupRequestId, secretarioId) => {
  const makeup = await MakeupRequest.findByPk(makeupRequestId);

  if (!makeup) {
    const err = new Error('Solicitud no encontrada');
    err.status = 404;
    throw err;
  }

  if (makeup.estado !== 'pendiente') {
    const err = new Error('Solicitud ya procesada');
    err.status = 409;
    throw err;
  }

  await makeup.update({ estado: 'rechazada', aprobado_por: secretarioId });
  return makeup;
};

const createMakeupRequest = async ({
  alumno_id,
  class_origen_id,
  class_destino_id,
  fecha_clase_origen,
  fecha_clase_destino,
}) => {
  const targetClass = await Class.findByPk(class_destino_id);
  if (!targetClass || !targetClass.activo) {
    const err = new Error('Clase destino no encontrada o inactiva');
    err.status = 404;
    throw err;
  }

  const regularCount = await Enrollment.count({
    where: { class_id: class_destino_id, activo: true },
  });

  const makeupCount = await MakeupRequest.count({
    where: { class_destino_id, fecha_clase_destino, estado: 'aprobada' },
  });

  if (regularCount + makeupCount >= targetClass.cupos_maximos) {
    const err = new Error('Sin cupos disponibles en clase destino');
    err.status = 409;
    throw err;
  }

  return MakeupRequest.create({
    alumno_id,
    class_origen_id,
    class_destino_id,
    fecha_clase_origen,
    fecha_clase_destino,
    estado: 'pendiente',
  });
};

module.exports = { approveMakeupRequest, rejectMakeupRequest, createMakeupRequest };
