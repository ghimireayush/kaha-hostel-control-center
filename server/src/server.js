const app = require('./app');

// Get port from environment or use default
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Kaha Hostel Booking Backend Server is running on port ${PORT}`);
  console.log(`Test endpoints like: GET http://localhost:${PORT}/api/v1/booking-requests`);
});