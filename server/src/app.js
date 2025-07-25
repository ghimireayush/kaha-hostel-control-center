const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const bookingRoutes = require('./routes/bookingRoutes');
const studentRoutes = require('./routes/studentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Swagger setup
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Security and utility middleware
// Use helmet to help secure the application by setting various HTTP headers
app.use(helmet());
// Use morgan for logging HTTP requests
app.use(morgan('combined')); // 'combined' gives more detailed logs
// Use cors to enable Cross-Origin Resource Sharing
app.use(cors());
// Built-in middleware for parsing JSON in the request body
app.use(express.json({ limit: '10mb' })); // Adjust limit as needed
// Built-in middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// --- Swagger Configuration ---
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kaha Hostel Control Center API',
      version: '1.0.0',
      description: 'API for managing bookings, students, rooms, and billing for Kaha Hostel.',
    },
    servers: [
      {
        url: 'http://localhost:3001', // Base URL without /api/v1 to avoid path duplication
        description: 'Development server',
      },
    ],
  },
  // Paths to files containing OpenAPI definitions (JSDoc comments)
  apis: [path.join(__dirname, 'controllers/*.js'), path.join(__dirname, 'routes/*.js')], // Use absolute paths
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// --- End Swagger Configuration ---
// --- Routes ---
// Mount the booking routes under the /api/v1/booking-requests path
app.use('/api/v1/booking-requests', bookingRoutes);
// Mount the student routes under the /api/v1/students path
app.use('/api/v1/students', studentRoutes);
// Mount the analytics routes under the /api/v1/analytics path
app.use('/api/v1/analytics', analyticsRoutes);


// --- Error Handling Middleware (Basic) ---
// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
  });
});

// Global error handler (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode,
    error: statusCode >= 500 ? 'Internal Server Error' : err.error || 'Error',
    message: err.message || 'Something went wrong!',
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
// --- End Error Handling ---

module.exports = app;