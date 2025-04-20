const { Pool, types } = require("pg");
const config = require('../config.json')

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

/******************
 * Helper functions
 ******************/

/**
 * Validates parameter based on type
 * @param {any} param - The parameter to validate
 * @param {string} type - The expected type ('string', 'number', 'boolean', etc.)
 * @param {object} options - Additional validation options
 * @returns {object} - Object with isValid flag and error message if invalid
 */
const validateParam = (param, type, options = {}) => {
  // Check if param is required but undefined or null
  if (options.required && (param === undefined || param === null)) {
    return { isValid: false, message: `Parameter is required` };
  }

  // If param is undefined/null but not required, it's valid
  if ((param === undefined || param === null) && !options.required) {
    return { isValid: true };
  }

  // Type validation
  switch (type) {
    case 'number':
      const num = Number(param);
      if (isNaN(num)) {
        return { isValid: false, message: 'Must be a number' };
      }
      if (options.min !== undefined && num < options.min) {
        return { isValid: false, message: `Must be at least ${options.min}` };
      }
      if (options.max !== undefined && num > options.max) {
        return { isValid: false, message: `Must be at most ${options.max}` };
      }
      break;
    case 'string':
      if (typeof param !== 'string') {
        return { isValid: false, message: 'Must be a string' };
      }
      if (options.minLength !== undefined && param.length < options.minLength) {
        return { isValid: false, message: `Must be at least ${options.minLength} characters` };
      }
      if (options.maxLength !== undefined && param.length > options.maxLength) {
        return { isValid: false, message: `Must be at most ${options.maxLength} characters` };
      }
      if (options.pattern && !options.pattern.test(param)) {
        return { isValid: false, message: 'Invalid format' };
      }
      break;
    case 'boolean':
      if (typeof param !== 'boolean' && param !== 'true' && param !== 'false' && param !== '0' && param !== '1') {
        return { isValid: false, message: 'Must be a boolean' };
      }
      break;
    case 'date':
      const date = new Date(param);
      if (isNaN(date.getTime())) {
        return { isValid: false, message: 'Must be a valid date' };
      }
      break;
  }

  return { isValid: true };
};

/**
 * Express middleware for handling errors in routes
 * @param {Function} routeHandler - The route handler function
 * @returns {Function} - Middleware function that catches errors
 */
const wrapAsync = (routeHandler) => {
  return async (req, res, next) => {
    try {
      await routeHandler(req, res, next);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error. Please try again later." });
    }
  };
};

module.exports = {
  connection,
  validateParam,
  wrapAsync
};