// Node's built-in Error class only accepts a message.
// We need a custom class that also accepts an HTTP statusCode (like 400, 401, 404)
// so we can tell the frontend exactly what went wrong.

// Custom error class that extends the built-in Error class
class ErrorHandler extends Error {
  // Constructor takes a message and a status code
  constructor(message, statusCode) {
    super(message); // Call the parent class constructor
    this.statusCode = statusCode; // Set the status code for the error
    Error.captureStackTrace(this, this.constructor); // This captures the exact line of code where the error happened for debugging
  }
}
export default ErrorHandler;
