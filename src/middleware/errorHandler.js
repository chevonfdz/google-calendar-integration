// Error handling middleware for detailed error messages
const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).send({ message });
};

export default errorHandler;
