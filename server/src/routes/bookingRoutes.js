const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/booking-requests:
 *   get:
 *     tags: [Booking Requests]
 *     summary: Get all booking requests
 *     description: Retrieve a list of booking requests with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, Pending, Approved, Rejected]
 *         description: Filter by booking status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or phone
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of booking requests
 */
router.get('/', bookingController.getAllBookingRequests);

/**
 * @swagger
 * /api/v1/booking-requests/stats:
 *   get:
 *     tags: [Booking Requests]
 *     summary: Get booking request statistics
 *     description: Retrieve statistics about booking requests
 *     responses:
 *       200:
 *         description: Booking request statistics
 */
router.get('/stats', bookingController.getBookingStats);

/**
 * @swagger
 * /api/v1/booking-requests/{id}:
 *   get:
 *     tags: [Booking Requests]
 *     summary: Get a booking request by ID
 *     description: Retrieve a specific booking request by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking request ID
 *     responses:
 *       200:
 *         description: A booking request
 *       404:
 *         description: Booking request not found
 */
router.get('/:id', bookingController.getBookingRequestById);

/**
 * @swagger
 * /api/v1/booking-requests/{id}/approve:
 *   post:
 *     tags: [Booking Requests]
 *     summary: Approve a booking request
 *     description: Approve a booking request and assign a room
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomAssignment
 *             properties:
 *               roomAssignment:
 *                 type: string
 *                 description: Room assigned to the student
 *     responses:
 *       200:
 *         description: Booking request approved
 *       404:
 *         description: Booking request not found
 *       422:
 *         description: Invalid input or booking already processed
 */
router.post('/:id/approve', bookingController.approveBookingRequest);

/**
 * @swagger
 * /api/v1/booking-requests/{id}/reject:
 *   post:
 *     tags: [Booking Requests]
 *     summary: Reject a booking request
 *     description: Reject a booking request with an optional reason
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Booking request rejected
 *       404:
 *         description: Booking request not found
 *       422:
 *         description: Booking already processed
 */
router.post('/:id/reject', bookingController.rejectBookingRequest);

/**
 * @swagger
 * /api/v1/booking-requests:
 *   post:
 *     tags: [Booking Requests]
 *     summary: Create a new booking request
 *     description: Submit a new booking request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - email
 *               - preferredRoom
 *               - checkInDate
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               guardianName:
 *                 type: string
 *               guardianPhone:
 *                 type: string
 *               preferredRoom:
 *                 type: string
 *               course:
 *                 type: string
 *               institution:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               duration:
 *                 type: string
 *               notes:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               address:
 *                 type: string
 *               idProofType:
 *                 type: string
 *               idProofNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking request created
 *       422:
 *         description: Invalid input
 */
router.post('/', bookingController.createBookingRequest);

module.exports = router;