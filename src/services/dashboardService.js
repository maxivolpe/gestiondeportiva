const { Op, fn, col } = require('sequelize');
const { User, Payment, Class, MakeupRequest, Enrollment } = require('../models');
const { startOfMonth, endOfMonth, startOfPrevMonth, endOfPrevMonth, addDays } = require('../utils/dateHelpers');

const getSummary = async () => {
  const now = new Date();
  const sevenDaysLater = addDays(now, 7);

  const [
    totalAlumnos,
    alumnosPagoVencido,
    alumnosVencen7Dias,
    ingresosMesActual,
    ingresosMesAnterior,
    clasesActivas,
    recuperosPendientes,
    enrollmentData,
  ] = await Promise.all([
    User.count({ where: { rol: 'alumno', activo: true } }),

    Payment.count({
      where: { estado: 'vencido' },
      distinct: true,
      col: 'alumno_id',
    }),

    Payment.count({
      where: {
        fecha_vencimiento: { [Op.between]: [now, sevenDaysLater] },
        estado: { [Op.ne]: 'pagado' },
      },
      distinct: true,
      col: 'alumno_id',
    }),

    Payment.sum('monto_final', {
      where: {
        estado: 'pagado',
        fecha_pago: { [Op.between]: [startOfMonth(), endOfMonth()] },
      },
    }),

    Payment.sum('monto_final', {
      where: {
        estado: 'pagado',
        fecha_pago: { [Op.between]: [startOfPrevMonth(), endOfPrevMonth()] },
      },
    }),

    Class.count({ where: { activo: true } }),

    MakeupRequest.count({ where: { estado: 'pendiente' } }),

    Enrollment.findAll({
      attributes: ['class_id', [fn('COUNT', col('id')), 'enrolled']],
      where: { activo: true },
      group: ['class_id'],
      raw: true,
    }),
  ]);

  let ocupacionPromedio = 0;
  if (enrollmentData.length > 0) {
    const classIds = enrollmentData.map((e) => e.class_id);
    const classes = await Class.findAll({
      where: { id: { [Op.in]: classIds }, activo: true },
      attributes: ['id', 'cupos_maximos'],
      raw: true,
    });
    const classMap = Object.fromEntries(classes.map((c) => [c.id, c.cupos_maximos]));
    const occupancies = enrollmentData.map((e) => {
      const max = classMap[e.class_id];
      return max ? (parseInt(e.enrolled) / max) * 100 : 0;
    });
    ocupacionPromedio = occupancies.reduce((a, b) => a + b, 0) / occupancies.length;
  }

  return {
    total_alumnos_activos: totalAlumnos,
    alumnos_con_pago_vencido: alumnosPagoVencido || 0,
    alumnos_vencen_7_dias: alumnosVencen7Dias || 0,
    ingresos_mes_actual: ingresosMesActual || 0,
    ingresos_mes_anterior: ingresosMesAnterior || 0,
    clases_activas_total: clasesActivas,
    ocupacion_promedio_por_clase: Math.round(ocupacionPromedio * 100) / 100,
    recuperos_pendientes: recuperosPendientes,
  };
};

module.exports = { getSummary };
