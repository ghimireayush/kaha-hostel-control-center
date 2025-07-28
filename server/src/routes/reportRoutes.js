const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/reports/stats:
 *   get:
 *     summary: Get report statistics
 *     description: Retrieve comprehensive statistics about generated reports
 *     responses:
 *       200:
 *         description: Successfully retrieved report statistics
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
 *                     totalReports:
 *                       type: integer
 *                     completedReports:
 *                       type: integer
 *                     scheduledReports:
 *                       type: integer
 *                     recentReports:
 *                       type: integer
 *                     reportsByType:
 *                       type: object
 *                     reportsByFormat:
 *                       type: object
 *                     totalFileSize:
 *                       type: number
 */
router.get('/stats', reportController.getReportStats);

/**
 * @swagger
 * /api/v1/reports/types:
 *   get:
 *     summary: Get available report types
 *     description: Retrieve list of available report types and their descriptions
 *     responses:
 *       200:
 *         description: Successfully retrieved report types
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
 *                       value:
 *                         type: string
 *                       label:
 *                         type: string
 *                       description:
 *                         type: string
 *                       icon:
 *                         type: string
 */
router.get('/types', reportController.getReportTypes);

/**
 * @swagger
 * /api/v1/reports/generate:
 *   post:
 *     summary: Generate new report
 *     description: Generate a new report based on specified parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Report name
 *               type:
 *                 type: string
 *                 enum: [financial, student, invoice, payment, ledger, occupancy]
 *                 description: Report type
 *               description:
 *                 type: string
 *                 description: Report description
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv, json]
 *                 default: pdf
 *                 description: Report format
 *               parameters:
 *                 type: object
 *                 description: Report-specific parameters
 *               generatedBy:
 *                 type: string
 *                 description: User who generated the report
 *     responses:
 *       201:
 *         description: Report generated successfully
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
 *       422:
 *         description: Validation error
 */
router.post('/generate', reportController.generateReport);

/**
 * @swagger
 * /api/v1/reports/schedule:
 *   post:
 *     summary: Schedule recurring report
 *     description: Schedule a report to be generated automatically on a recurring basis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - scheduleConfig
 *             properties:
 *               name:
 *                 type: string
 *                 description: Report name
 *               type:
 *                 type: string
 *                 enum: [financial, student, invoice, payment, ledger, occupancy]
 *                 description: Report type
 *               description:
 *                 type: string
 *                 description: Report description
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv, json]
 *                 default: pdf
 *                 description: Report format
 *               parameters:
 *                 type: object
 *                 description: Report-specific parameters
 *               scheduleConfig:
 *                 type: object
 *                 required:
 *                   - frequency
 *                 properties:
 *                   frequency:
 *                     type: string
 *                     enum: [daily, weekly, monthly]
 *                   time:
 *                     type: string
 *                     description: Time to generate (HH:MM format)
 *                   dayOfWeek:
 *                     type: string
 *                     description: Day of week for weekly reports
 *                   dayOfMonth:
 *                     type: integer
 *                     description: Day of month for monthly reports
 *                   recipients:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of recipients
 *     responses:
 *       201:
 *         description: Report scheduled successfully
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
 *       422:
 *         description: Validation error
 */
router.post('/schedule', reportController.scheduleReport);

/**
 * @swagger
 * /api/v1/reports/download/{id}:
 *   get:
 *     summary: Get report download information
 *     description: Get download information for a specific report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Successfully retrieved download information
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
 *                     reportId:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     filePath:
 *                       type: string
 *                     format:
 *                       type: string
 *                     fileSize:
 *                       type: string
 *                     downloadUrl:
 *                       type: string
 *       404:
 *         description: Report not found
 *       422:
 *         description: Report not ready for download
 */
router.get('/download/:id', reportController.getReportDownload);

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     summary: Get all reports
 *     description: Retrieve a list of reports with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, financial, student, invoice, payment, ledger, occupancy]
 *         description: Filter by report type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, completed, scheduled, processing, failed]
 *         description: Filter by report status
 *       - in: query
 *         name: generatedBy
 *         schema:
 *           type: string
 *         description: Filter by user who generated the report
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter reports from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter reports to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in report name, description, type
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
 *         description: Successfully retrieved reports
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
router.get('/', reportController.getAllReports);

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     description: Retrieve a specific report by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Successfully retrieved report
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
 *         description: Report not found
 */
router.get('/:id', reportController.getReportById);

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   delete:
 *     summary: Delete report
 *     description: Delete a specific report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
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
 *                 message:
 *                   type: string
 *       404:
 *         description: Report not found
 */
router.delete('/:id', reportController.deleteReport);

module.exports = router;