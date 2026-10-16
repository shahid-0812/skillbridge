const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const clientMessage =
    statusCode >= 500
      ? "Internal server error"
      : err.message || "Request failed";

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    code: err.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
    details: statusCode >= 500 ? {} : err.details || {},
  });
};

module.exports = errorMiddleware;
