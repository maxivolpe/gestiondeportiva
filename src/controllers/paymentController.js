const paymentService = require('../services/paymentService');
const { success, paginated } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { alumno_id, estado, page = 1, limit = 20 } = req.query;
    const result = await paymentService.getPayments(
      { alumno_id, estado, page: parseInt(page), limit: parseInt(limit) },
      req.user
    );
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
    const { alumno_id, plan_id, fecha_inicio, notas } = req.body;
    const payment = await paymentService.createPayment(
      { alumno_id, plan_id, fecha_inicio, notas },
      req.user.id
    );
    success(res, payment, 'Pago registrado', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body);
    success(res, payment, 'Pago actualizado');
  } catch (err) {
    next(err);
  }
};

const getDueSoon = async (req, res, next) => {
  try {
    const payments = await paymentService.getDueSoon(7);
    success(res, payments, 'Pagos próximos a vencer');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, getDueSoon };
