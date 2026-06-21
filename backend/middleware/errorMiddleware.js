const fs = require('fs');
const path = require('path');

/**
 * Middleware to handle unmatched route endpoints (404 Not Found)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Write error to log file
  const logMsg = `${new Date().toISOString()} - ${statusCode} - ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(path.join(__dirname, '../error.log'), logMsg);

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
