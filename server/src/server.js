const app = require('./app');

// Get port from environment or use default
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Kaha Hostel Control Center Backend Server is running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  Booking: GET http://localhost:${PORT}/api/v1/booking-requests`);
  console.log(`  Students: GET http://localhost:${PORT}/api/v1/students`);
  console.log(`  Analytics: GET http://localhost:${PORT}/api/v1/analytics`);
  console.log(`  Invoices: GET http://localhost:${PORT}/api/v1/invoices`);
  console.log(`  Payments: GET http://localhost:${PORT}/api/v1/payments`);
  console.log(`  Rooms: GET http://localhost:${PORT}/api/v1/rooms`);
  console.log(`  Room Stats: GET http://localhost:${PORT}/api/v1/rooms/stats`);
  console.log(`  Discounts: GET http://localhost:${PORT}/api/v1/discounts`);
  console.log(`  Discount Stats: GET http://localhost:${PORT}/api/v1/discounts/stats`);
  console.log(`  API Docs: http://localhost:${PORT}/api-docs`);
});