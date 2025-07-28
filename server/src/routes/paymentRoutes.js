const express = require("express");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Specific routes must come before parameterized routes

/**
 * @swagger
 * /api/v1/payments/stats:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get payment statistics
 *     description: Retrieve statistics about payments including totals, counts, and trends
 *     responses:
 *       200:
 *         description: Successfully retrieved payment statistics
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
 *                     totalPayments:
 *                       type: integer
 *                     totalAmount:
 *                       type: number
 *                     monthlyPayments:
 *                       type: integer
 *                     monthlyAmount:
 *                       type: number
 *                     todayPayments:
 *                       type: integer
 *                     todayAmount:
 *                       type: number
 *                     averagePayment:
 *                       type: number
 *                     paymentMethods:
 *                       type: object
 *                     recentPayments:
 *                       type: array
 */
router.get("/stats", paymentController.getPaymentStats);

/**
 * @swagger
 * /api/v1/payments/bulk:
 *   post:
 *     tags: [Payment Management]
 *     summary: Process bulk payments
 *     description: Process multiple payments at once
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payments
 *             properties:
 *               payments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - amount
 *                     - paymentMethod
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     paymentMethod:
 *                       type: string
 *                     paymentDate:
 *                       type: string
 *                       format: date
 *                     reference:
 *                       type: string
 *                     notes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bulk payments processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                     failed:
 *                       type: array
 *                     successCount:
 *                       type: integer
 *                     failedCount:
 *                       type: integer
 */
router.post("/bulk", paymentController.processBulkPayments);

/**
 * @swagger
 * /api/v1/payments/student/{studentId}:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get payments by student ID
 *     description: Retrieve all payments for a specific student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Successfully retrieved student payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Student not found
 */
router.get("/student/:studentId", paymentController.getPaymentsByStudentId);

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get all payments
 *     description: Retrieve a list of payments with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [all, Cash, Bank Transfer, Online, Card]
 *         description: Filter by payment method
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in student name, phone, room, payment ID, reference
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
 *         description: Successfully retrieved payments
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
 */
router.get("/", paymentController.getAllPayments);

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     tags: [Payment Management]
 *     summary: Record new payment
 *     description: Record a new payment from a student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Payment amount
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Bank Transfer, Online, Card]
 *                 description: Payment method
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Payment date (defaults to today)
 *               reference:
 *                 type: string
 *                 description: Payment reference/transaction ID
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               invoiceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Invoice IDs to allocate payment to
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *       404:
 *         description: Student not found
 *       422:
 *         description: Validation error
 */
router.post("/", paymentController.recordPayment);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get payment by ID
 *     description: Retrieve a specific payment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Successfully retrieved payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *       404:
 *         description: Payment not found
 */
router.get("/:id", paymentController.getPaymentById);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   put:
 *     tags: [Payment Management]
 *     summary: Update payment
 *     description: Update an existing payment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               reference:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Completed, Pending, Cancelled]
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *       404:
 *         description: Payment not found
 */
router.put("/:id", paymentController.updatePayment);

/**
 * @swagger
 * /api/v1/payments/{id}/allocate:
 *   post:
 *     tags: [Payment Management]
 *     summary: Allocate payment to invoices
 *     description: Allocate a payment amount to specific invoices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceAllocations
 *             properties:
 *               invoiceAllocations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - invoiceId
 *                     - amount
 *                   properties:
 *                     invoiceId:
 *                       type: string
 *                       description: Invoice ID
 *                     amount:
 *                       type: number
 *                       minimum: 0.01
 *                       description: Amount to allocate to this invoice
 *     responses:
 *       200:
 *         description: Payment allocated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                     failed:
 *                       type: array
 *                     totalAllocated:
 *                       type: number
 *       404:
 *         description: Payment not found
 *       422:
 *         description: Validation error or allocation exceeds payment amount
 */
router.post("/:id/allocate", paymentController.allocatePaymentToInvoices);

module.exports = router;
