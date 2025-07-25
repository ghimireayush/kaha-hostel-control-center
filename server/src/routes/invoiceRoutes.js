const express = require('express');
const billingController = require('../controllers/billingController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: Get all invoices
 *     description: Retrieve a list of invoices with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, Paid, Unpaid, Partially Paid]
 *         description: Filter by invoice status
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{4}-[0-9]{2}$'
 *         description: Filter by month (YYYY-MM format)
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
 *         description: Successfully retrieved invoices
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
router.get('/', billingController.getAllInvoices);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     description: Retrieve a specific invoice by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The invoice ID
 *     responses:
 *       200:
 *         description: Successfully retrieved invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 invoice:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     studentId:
 *                       type: string
 *                     studentName:
 *                       type: string
 *                     roomNumber:
 *                       type: string
 *                     month:
 *                       type: string
 *                     total:
 *                       type: number
 *                     status:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     items:
 *                       type: array
 *                     payments:
 *                       type: array
 *                     discounts:
 *                       type: array
 *                     subtotal:
 *                       type: number
 *                     discountTotal:
 *                       type: number
 *                     paymentTotal:
 *                       type: number
 *                     balanceDue:
 *                       type: number
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', billingController.getInvoiceById);

module.exports = router;
