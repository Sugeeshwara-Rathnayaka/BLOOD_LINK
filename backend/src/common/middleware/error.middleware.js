// Node's built-in Error class only accepts a message.
// We need a custom class that also accepts an HTTP statusCode (like 400, 401, 404)
// so we can tell the frontend exactly what went wrong.

class ErrorHandler extends Error {
  // Custom error class that extends the built-in Error class
  constructor(message, statusCode) {
    // Constructor takes a message and a status code
    super(message); // Call the parent class constructor
    this.statusCode = statusCode; // Set the status code for the error

    // This captures the exact line of code where the error happened for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
