const express = require('express');
const billingController = require('../controllers/billingController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get all payments
 *     description: Retrieve a list of payments with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD format)
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [all, Cash, Bank Transfer, Credit Card, Debit Card]
 *         description: Filter by payment method
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
 *                         properties:
 *                           id:
 *                             type: string
 *                           studentId:
 *                             type: string
 *                           studentName:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           paymentMethod:
 *                             type: string
 *                           paymentDate:
 *                             type: string
 *                           reference:
 *                             type: string
 *                           notes:
 *                             type: string
 *                           createdBy:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           invoiceIds:
 *                             type: array
 *                             items:
 *                               type: string
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPayments:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 *       422:
 *         description: Invalid query parameters
 */
router.get('/', billingController.getAllPayments);

module.exports = router;
