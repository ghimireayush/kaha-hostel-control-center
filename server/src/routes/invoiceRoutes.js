const express = require('express');
const invoiceController = require('../controllers/invoiceController');

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
router.get('/', invoiceController.getAllInvoices);

/**
 * @swagger
 * /api/v1/invoices/stats:
 *   get:
 *     summary: Get invoice statistics
 *     description: Retrieve statistics about invoices including totals, counts, and collection rates
 *     responses:
 *       200:
 *         description: Successfully retrieved invoice statistics
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
 *                     totalInvoices:
 *                       type: integer
 *                     paidInvoices:
 *                       type: integer
 *                     unpaidInvoices:
 *                       type: integer
 *                     partiallyPaidInvoices:
 *                       type: integer
 *                     overdueInvoices:
 *                       type: integer
 *                     totalAmount:
 *                       type: number
 *                     paidAmount:
 *                       type: number
 *                     outstandingAmount:
 *                       type: number
 *                     collectionRate:
 *                       type: number
 */
router.get('/stats', invoiceController.getInvoiceStats);

/**
 * @swagger
 * /api/v1/invoices:
 *   post:
 *     summary: Create new invoice
 *     description: Create a new invoice for a student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - month
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               month:
 *                 type: string
 *                 pattern: '^[0-9]{4}-[0-9]{2}$'
 *                 description: Month in YYYY-MM format
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Invoice created successfully
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
 *         description: Validation error or invoice already exists
 */
router.post('/', invoiceController.createInvoice);

/**
 * @swagger
 * /api/v1/invoices/generate-monthly:
 *   post:
 *     summary: Generate monthly invoices
 *     description: Generate invoices for all active students for a specific month
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *             properties:
 *               month:
 *                 type: string
 *                 pattern: '^[0-9]{4}-[0-9]{2}$'
 *                 description: Month in YYYY-MM format
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional array of specific student IDs
 *     responses:
 *       200:
 *         description: Monthly invoices generated successfully
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
 *                     skipped:
 *                       type: array
 *                     successCount:
 *                       type: integer
 *                     failedCount:
 *                       type: integer
 *                     skippedCount:
 *                       type: integer
 *       422:
 *         description: Validation error
 */
router.post('/generate-monthly', invoiceController.generateMonthlyInvoices);

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
 *                 data:
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
router.get('/:id', invoiceController.getInvoiceById);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   put:
 *     summary: Update invoice
 *     description: Update an existing invoice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Paid, Unpaid, Partially Paid]
 *               notes:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Invoice updated successfully
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
 *         description: Invoice not found
 */
router.put('/:id', invoiceController.updateInvoice);

/**
 * @swagger
 * /api/v1/invoices/{id}/send:
 *   post:
 *     summary: Send invoice to student
 *     description: Send invoice to student via email or SMS
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The invoice ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [email, sms]
 *                 default: email
 *                 description: Method to send invoice
 *     responses:
 *       200:
 *         description: Invoice sent successfully
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
 *                     invoiceId:
 *                       type: string
 *                     studentId:
 *                       type: string
 *                     studentName:
 *                       type: string
 *                     method:
 *                       type: string
 *                     sentAt:
 *                       type: string
 *                     status:
 *                       type: string
 *                     message:
 *                       type: string
 *       404:
 *         description: Invoice not found
 */
router.post('/:id/send', invoiceController.sendInvoice);

module.exports = router;
