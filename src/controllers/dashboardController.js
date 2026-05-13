const dashboardService = require('../services/dashboardService');
const { success } = require('../utils/apiResponse');

const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    success(res, data, 'Dashboard cargado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
