import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware factory for Zod validation on request body.
 * @param {import("zod").ZodSchema} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        return next(new ApiError(400, "Validation failed", formattedErrors));
      }
      next(error);
    }
  };
}
