const { AppError, NotFoundError } = require('../errors/AppError');
const { logger } = require('./logger');

const notFound = (req, res, next) => {
  next(new NotFoundError('Route Not Found'));
}

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // only log truly unexpected errors, not known ones like 404/400
  logger.error({ err, url: req.url, method: req.method }, 'Unexpected error');
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = { notFound, errorHandler };
