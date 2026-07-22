export const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res, statusCode = 500, message = 'Error', errors = []) => {
  res.status(statusCode).json({ success: false, message, errors });
};
