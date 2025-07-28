const express = require('express');
const ledgerController = require('../controllers/ledgerController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/ledgers/stats:
 *   get:
 *     tags: [Ledger Management]
 *     summary: Get ledger statistics
 *     description: Retrieve comprehensive statistics about ledger entries
 *     responses:
 *       200:
 *         description: Successfully retrieved ledger statistics
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
 *                     totalEntries:
 *                       type: integer
 *                     totalDebits:
 *                       type: number
 *                     totalCredits:
 *                       type: number
 *                     studentsWithBalance:
 *                       type: integer
 *                     studentsWithCredit:
 *                       type: integer
 *                     studentsWithDebit:
 *                       type: integer
 *                     outstandingAmount:
 *                       type: number
 *                     advanceAmount:
 *                       type: number
 *                     entryTypes:
 *                       type: object
 *                     monthlyTrends:
 *                       type: object
 *                     recentEntries:
 *                       type: array
 */
router.get('/stats', ledgerController.getLedgerStats);

/**
 * @swagger
 * /api/v1/ledgers/generate:
 *   post:
 *     tags: [Ledger Management]
 *     summary: Generate ledger entries from invoices and payments
 *     description: Automatically generate ledger entries from existing invoices and payments
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forceRegenerate:
 *                 type: boolean
 *                 description: Force regeneration of existing entries
 *               dateFrom:
 *                 type: string
 *                 format: date
 *                 description: Generate entries from this date
 *               dateTo:
 *                 type: string
 *                 format: date
 *                 description: Generate entries to this date
 *     responses:
 *       200:
 *         description: Ledger entries generated successfully
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
 *                     totalGenerated:
 *                       type: integer
 *                     totalSkipped:
 *                       type: integer
 *                     totalErrors:
 *                       type: integer
 *                     invoiceEntries:
 *                       type: array
 *                     paymentEntries:
 *                       type: array
 *                     skipped:
 *                       type: array
 *                     errors:
 *                       type: array
 */
router.post('/generate', ledgerController.generateLedgerEntries);

/**
 * @swagger
 * /api/v1/ledgers/student/{studentId}:
 *   get:
 *     tags: [Ledger Management]
 *     summary: Get ledger entries for a specific student
 *     description: Retrieve all ledger entries for a specific student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Successfully retrieved student ledger
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       studentId:
 *                         type: string
 *                       studentName:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       referenceId:
 *                         type: string
 *                       debit:
 *                         type: number
 *                       credit:
 *                         type: number
 *                       balance:
 *                         type: number
 *                       balanceType:
 *                         type: string
 *       404:
 *         description: Student not found
 */
router.get('/student/:studentId', ledgerController.getStudentLedger);

/**
 * @swagger
 * /api/v1/ledgers/balance/{studentId}:
 *   get:
 *     tags: [Ledger Management]
 *     summary: Get student balance summary
 *     description: Get comprehensive balance summary for a specific student
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Successfully retrieved student balance
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
 *                     studentId:
 *                       type: string
 *                     studentName:
 *                       type: string
 *                     roomNumber:
 *                       type: string
 *                     totalDebits:
 *                       type: number
 *                     totalCredits:
 *                       type: number
 *                     currentBalance:
 *                       type: number
 *                     balanceType:
 *                       type: string
 *                     rawBalance:
 *                       type: number
 *                     entryCount:
 *                       type: integer
 *                     lastEntryDate:
 *                       type: string
 *                     lastEntryType:
 *                       type: string
 *       404:
 *         description: Student not found
 */
router.get('/balance/:studentId', ledgerController.getStudentBalance);

/**
 * @swagger
 * /api/v1/ledgers:
 *   get:
 *     tags: [Ledger Management]
 *     summary: Get all ledger entries
 *     description: Retrieve a list of ledger entries with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, Invoice, Payment, Discount, Adjustment]
 *         description: Filter by entry type
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in description, student name, reference ID
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
 *         description: Successfully retrieved ledger entries
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
router.get('/', ledgerController.getAllLedgerEntries);

/**
 * @swagger
 * /api/v1/ledgers:
 *   post:
 *     tags: [Ledger Management]
 *     summary: Create new ledger entry
 *     description: Create a new manual ledger entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - type
 *               - description
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               type:
 *                 type: string
 *                 enum: [Invoice, Payment, Discount, Adjustment]
 *                 description: Entry type
 *               description:
 *                 type: string
 *                 description: Entry description
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Entry date (defaults to today)
 *               debit:
 *                 type: number
 *                 minimum: 0
 *                 description: Debit amount
 *               credit:
 *                 type: number
 *                 minimum: 0
 *                 description: Credit amount
 *               referenceId:
 *                 type: string
 *                 description: Reference ID (invoice, payment, etc.)
 *     responses:
 *       201:
 *         description: Ledger entry created successfully
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
router.post('/', ledgerController.createLedgerEntry);

/**
 * @swagger
 * /api/v1/ledgers/{id}:
 *   put:
 *     tags: [Ledger Management]
 *     summary: Update ledger entry
 *     description: Update an existing ledger entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ledger entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               debit:
 *                 type: number
 *               credit:
 *                 type: number
 *               referenceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ledger entry updated successfully
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
 *         description: Ledger entry not found
 */
router.put('/:id', ledgerController.updateLedgerEntry);

module.exports = router;