const success = (res, data, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

const paginated = (res, data, pagination, message = 'OK') =>
  res.status(200).json({ success: true, data, pagination, message });

const error = (res, message, statusCode = 400, errors = []) =>
  res.status(statusCode).json({ success: false, message, errors });

module.exports = { success, paginated, error };
