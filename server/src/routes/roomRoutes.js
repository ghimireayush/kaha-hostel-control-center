const express = require('express');
const roomController = require('../controllers/roomController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/rooms:
 *   get:
 *     summary: Get all rooms
 *     description: Retrieve a list of rooms with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, Active, Maintenance, Inactive]
 *         description: Filter by room status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, Dormitory, Suite, Private]
 *         description: Filter by room type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for room number, name, or occupant name
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
 *         description: Successfully retrieved rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       422:
 *         description: Invalid query parameters
 */
router.get('/', roomController.getAllRooms);

/**
 * @swagger
 * /api/v1/rooms/stats:
 *   get:
 *     summary: Get room statistics
 *     description: Retrieve comprehensive room statistics including occupancy and revenue data
 *     responses:
 *       200:
 *         description: Successfully retrieved room statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalRooms:
 *                       type: integer
 *                     activeRooms:
 *                       type: integer
 *                     maintenanceRooms:
 *                       type: integer
 *                     inactiveRooms:
 *                       type: integer
 *                     totalBeds:
 *                       type: integer
 *                     occupiedBeds:
 *                       type: integer
 *                     availableBeds:
 *                       type: integer
 *                     occupancyRate:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     averageRate:
 *                       type: number
 *                     byType:
 *                       type: object
 */
router.get('/stats', roomController.getRoomStats);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     description: Retrieve a specific room by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     responses:
 *       200:
 *         description: Successfully retrieved room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 room:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     bedCount:
 *                       type: integer
 *                     occupancy:
 *                       type: integer
 *                     gender:
 *                       type: string
 *                     monthlyRate:
 *                       type: number
 *                     dailyRate:
 *                       type: number
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     status:
 *                       type: string
 *                     floor:
 *                       type: string
 *                     roomNumber:
 *                       type: string
 *                     occupants:
 *                       type: array
 *                     availableBeds:
 *                       type: integer
 *                     lastCleaned:
 *                       type: string
 *                     maintenanceStatus:
 *                       type: string
 *                     pricingModel:
 *                       type: string
 *                     description:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: Room not found
 */
router.get('/:id', roomController.getRoomById);

/**
 * @swagger
 * /api/v1/rooms:
 *   post:
 *     summary: Create a new room (Placeholder)
 *     description: Create a new room with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               bedCount:
 *                 type: integer
 *               gender:
 *                 type: string
 *               monthlyRate:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               floor:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 *       422:
 *         description: Invalid request data
 */
router.post('/', roomController.createRoom);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   put:
 *     summary: Update a room (Placeholder)
 *     description: Update an existing room with the provided data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               bedCount:
 *                 type: integer
 *               gender:
 *                 type: string
 *               monthlyRate:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 *       422:
 *         description: Invalid request data
 */
router.put('/:id', roomController.updateRoom);

/**
 * @swagger
 * /api/v1/rooms/{id}/assign:
 *   post:
 *     summary: Assign student to room (Placeholder)
 *     description: Assign a student to the specified room
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The student ID to assign
 *             required:
 *               - studentId
 *     responses:
 *       200:
 *         description: Student assigned successfully
 *       404:
 *         description: Room or student not found
 *       422:
 *         description: Invalid request data or room not available
 */
router.post('/:id/assign', roomController.assignStudent);

/**
 * @swagger
 * /api/v1/rooms/{id}/vacate:
 *   post:
 *     summary: Remove student from room (Placeholder)
 *     description: Remove a student from the specified room
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The student ID to remove
 *             required:
 *               - studentId
 *     responses:
 *       200:
 *         description: Student removed successfully
 *       404:
 *         description: Room or student not found
 *       422:
 *         description: Invalid request data or student not in room
 */
router.post('/:id/vacate', roomController.vacateStudent);

/**
 * @swagger
 * /api/v1/rooms/{id}/maintenance:
 *   post:
 *     summary: Schedule room maintenance (Placeholder)
 *     description: Schedule maintenance for the specified room
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduleDate:
 *                 type: string
 *                 format: date
 *                 description: The date to schedule maintenance
 *               notes:
 *                 type: string
 *                 description: Additional notes for the maintenance
 *     responses:
 *       200:
 *         description: Maintenance scheduled successfully
 *       404:
 *         description: Room not found
 *       422:
 *         description: Invalid request data
 */
router.post('/:id/maintenance', roomController.scheduleMaintenance);

module.exports = router;
