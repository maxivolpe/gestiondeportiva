const { PaymentPlan } = require('../models');
const { success, error } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const plans = await PaymentPlan.findAll({ where: { activo: true } });
    success(res, plans);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { nombre, duracion_dias, precio_base, descuento_porcentaje } = req.body;
    const plan = await PaymentPlan.create({ nombre, duracion_dias, precio_base, descuento_porcentaje });
    success(res, plan, 'Plan creado', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const plan = await PaymentPlan.findByPk(req.params.id);
    if (!plan) return error(res, 'Plan no encontrado', 404);
    const { nombre, duracion_dias, precio_base, descuento_porcentaje, activo } = req.body;
    await plan.update({ nombre, duracion_dias, precio_base, descuento_porcentaje, activo });
    success(res, plan, 'Plan actualizado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update };
