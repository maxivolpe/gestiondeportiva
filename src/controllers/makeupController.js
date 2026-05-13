const makeupService = require('../services/makeupService');
const { MakeupRequest, User, Class } = require('../models');
const { success, paginated } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.rol === 'alumno') {
      where.alumno_id = req.user.id;
    } else if (req.user.rol === 'secretario') {
      where.estado = 'pendiente';
    }

    const { page = 1, limit = 20 } = req.query;
    const { count, rows } = await MakeupRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'alumno', attributes: ['id', 'nombre', 'email'] },
        { model: Class, as: 'claseOrigen' },
        { model: Class, as: 'claseDestino' },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
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
    const { class_origen_id, class_destino_id, fecha_clase_origen, fecha_clase_destino } = req.body;
    const makeup = await makeupService.createMakeupRequest({
      alumno_id: req.user.id,
      class_origen_id,
      class_destino_id,
      fecha_clase_origen,
      fecha_clase_destino,
    });
    success(res, makeup, 'Solicitud de recupero enviada', 201);
  } catch (err) {
    next(err);
  }
};

const approve = async (req, res, next) => {
  try {
    const makeup = await makeupService.approveMakeupRequest(req.params.id, req.user.id);
    success(res, makeup, 'Recupero aprobado');
  } catch (err) {
    next(err);
  }
};

const reject = async (req, res, next) => {
  try {
    const makeup = await makeupService.rejectMakeupRequest(req.params.id, req.user.id);
    success(res, makeup, 'Recupero rechazado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, approve, reject };
