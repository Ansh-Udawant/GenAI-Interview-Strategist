/**
 * Standardized API Response class for uniform JSON responses.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response payload
   * @param {string} message - Success message
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
