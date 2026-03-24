// Middleware to catch async errors in route handlers

export const catchAsyncErrors = (theFunc) => {
  // theFunc is the async route handler function we want to wrap
  return (req, res, next) => {
    // The middleware function that will be called by Express
    Promise.resolve(theFunc(req, res, next)).catch(next);
  }; // We call theFunc with req, res, and next. If it returns a promise that rejects (i.e., throws an error), we catch it and pass it to next(), which should be the error handling middleware in Express.
};
