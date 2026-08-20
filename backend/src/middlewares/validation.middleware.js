import { ApiError } from '../utils/ApiError.js';

/**
 * Validate request body/query/params against a Joi schema.
 * 
 * @param {object} schema - Joi schema to validate
 * @param {string} source - 'body', 'query', or 'params'
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw ApiError.validation(errors);
    }
    
    if (source === 'body') {
      req.body = value;
    } else if (source === 'query') {
      req.query = value;
    } else {
      req.params = value;
    }
    
    next();
  };
};
