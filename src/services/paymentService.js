const { Op } = require('sequelize');
const { Payment, PaymentPlan, User } = require('../models');
const { addDays } = require('../utils/dateHelpers');

const getPayments = async ({ alumno_id, estado, page = 1, limit = 20 }, requestingUser) => {
  const where = {};

  if (requestingUser.rol === 'alumno') {
    where.alumno_id = requestingUser.id;
  } else {
    if (alumno_id) where.alumno_id = alumno_id;
    if (estado) where.estado = estado;
  }

  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [
      { model: User, as: 'alumno', attributes: ['id', 'nombre', 'email'] },
      { model: PaymentPlan, as: 'plan' },
    ],
    limit,
    offset: (page - 1) * limit,
    order: [['fecha_vencimiento', 'DESC']],
  });

  return { rows, count, page, limit, pages: Math.ceil(count / limit) };
};

const createPayment = async ({ alumno_id, plan_id, fecha_inicio, notas }, registrado_por) => {
  const plan = await PaymentPlan.findByPk(plan_id);
  if (!plan || !plan.activo) {
    const err = new Error('Plan de pago no encontrado');
    err.status = 404;
    throw err;
  }

  const fecha_vencimiento = addDays(new Date(fecha_inicio), plan.duracion_dias);
  const monto_final = (
    parseFloat(plan.precio_base) * (1 - plan.descuento_porcentaje / 100)
  ).toFixed(2);

  return Payment.create({
    alumno_id,
    plan_id,
    fecha_inicio,
    fecha_vencimiento,
    monto_final,
    estado: 'pendiente',
    notas,
    registrado_por,
  });
};

const updatePayment = async (paymentId, { estado, notas, fecha_pago }) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    const err = new Error('Pago no encontrado');
    err.status = 404;
    throw err;
  }

  const updates = {};
  if (estado !== undefined) updates.estado = estado;
  if (notas !== undefined) updates.notas = notas;
  if (fecha_pago !== undefined) updates.fecha_pago = fecha_pago;

  await payment.update(updates);
  return payment;
};

const getDueSoon = async (days = 7) => {
  const now = new Date();
  const future = addDays(now, days);

  return Payment.findAll({
    where: {
      fecha_vencimiento: { [Op.between]: [now, future] },
      estado: { [Op.ne]: 'pagado' },
    },
    include: [{ model: User, as: 'alumno', attributes: ['id', 'nombre', 'email'] }],
    order: [['fecha_vencimiento', 'ASC']],
  });
};

module.exports = { getPayments, createPayment, updatePayment, getDueSoon };
