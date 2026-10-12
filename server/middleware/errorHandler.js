export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // MongoDB duplicate key error (E11000)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'You have already registered for this event with this email address.'
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. ')
    });
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found with the specified ID.'
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
