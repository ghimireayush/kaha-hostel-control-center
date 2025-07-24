const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of students with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, Active, Inactive]
 *         description: Filter by student status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, room number, or phone
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
 *         description: A list of students
 */
router.get('/', studentController.getAllStudents);

/**
 * @swagger
 * /api/v1/students/stats:
 *   get:
 *     summary: Get student statistics
 *     description: Retrieve statistics about students including counts and financial data
 *     responses:
 *       200:
 *         description: Student statistics
 */
router.get('/stats', studentController.getStudentStats);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     description: Retrieve a specific student by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: A student
 *       404:
 *         description: Student not found
 */
router.get('/:id', studentController.getStudentById);

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     summary: Create a new student
 *     description: Create a new student profile
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
 *               - roomNumber
 *             properties:
 *               name:
 *                 type: string
 *                 description: Student's full name
 *               phone:
 *                 type: string
 *                 description: Student's phone number
 *               email:
 *                 type: string
 *                 description: Student's email address
 *               roomNumber:
 *                 type: string
 *                 description: Assigned room number
 *               guardianName:
 *                 type: string
 *                 description: Guardian's name
 *               guardianPhone:
 *                 type: string
 *                 description: Guardian's phone number
 *               address:
 *                 type: string
 *                 description: Student's address
 *               baseMonthlyFee:
 *                 type: number
 *                 description: Base monthly fee
 *               laundryFee:
 *                 type: number
 *                 description: Laundry fee
 *               foodFee:
 *                 type: number
 *                 description: Food fee
 *               emergencyContact:
 *                 type: string
 *                 description: Emergency contact number
 *               course:
 *                 type: string
 *                 description: Course of study
 *               institution:
 *                 type: string
 *                 description: Educational institution
 *               idProofType:
 *                 type: string
 *                 description: Type of ID proof
 *               idProofNumber:
 *                 type: string
 *                 description: ID proof number
 *               bookingRequestId:
 *                 type: string
 *                 description: Related booking request ID
 *     responses:
 *       201:
 *         description: Student created successfully
 *       422:
 *         description: Invalid input data
 */
router.post('/', studentController.createStudent);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     summary: Update a student
 *     description: Update an existing student's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               guardianName:
 *                 type: string
 *               guardianPhone:
 *                 type: string
 *               address:
 *                 type: string
 *               baseMonthlyFee:
 *                 type: number
 *               laundryFee:
 *                 type: number
 *               foodFee:
 *                 type: number
 *               currentBalance:
 *                 type: number
 *               advanceBalance:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               emergencyContact:
 *                 type: string
 *               course:
 *                 type: string
 *               institution:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 *       422:
 *         description: Invalid input data
 */
router.put('/:id', studentController.updateStudent);

/**
 * @swagger
 * /api/v1/students/{id}/checkout:
 *   post:
 *     summary: Process student checkout
 *     description: Process a student checkout with optional refund and notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkoutDate
 *             properties:
 *               checkoutDate:
 *                 type: string
 *                 format: date
 *                 description: Date of checkout
 *               reason:
 *                 type: string
 *                 description: Reason for checkout
 *               refundAmount:
 *                 type: number
 *                 description: Amount to refund
 *               refundMethod:
 *                 type: string
 *                 description: Method of refund
 *               refundReference:
 *                 type: string
 *                 description: Reference for refund
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               finalBillSettled:
 *                 type: boolean
 *                 description: Whether final bill is settled
 *               roomCondition:
 *                 type: string
 *                 description: Condition of room at checkout
 *     responses:
 *       200:
 *         description: Checkout processed successfully
 *       404:
 *         description: Student not found
 *       422:
 *         description: Invalid input or student already inactive
 */
router.post('/:id/checkout', studentController.processCheckout);

module.exports = router;