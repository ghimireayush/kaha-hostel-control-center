const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics data
 *     description: Retrieve comprehensive dashboard analytics including revenue, bookings, occupancy, and performance metrics
 *     responses:
 *       200:
 *         description: Dashboard analytics data
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         monthlyRevenue:
 *                           type: number
 *                         revenueGrowth:
 *                           type: number
 *                         totalBookings:
 *                           type: number
 *                         bookingsGrowth:
 *                           type: number
 *                         avgOccupancy:
 *                           type: number
 *                         occupancyGrowth:
 *                           type: number
 *                         growthRate:
 *                           type: number
 *                     monthlyData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           bookings:
 *                             type: number
 *                           occupancy:
 *                             type: number
 *                     guestTypeData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           value:
 *                             type: number
 *                           count:
 *                             type: number
 *                     performanceMetrics:
 *                       type: object
 *                       properties:
 *                         averageDailyRate:
 *                           type: number
 *                         revenuePerAvailableBed:
 *                           type: number
 *                         averageLengthOfStay:
 *                           type: number
 *                         repeatGuestRate:
 *                           type: number
 */
router.get('/dashboard', analyticsController.getDashboardData);

module.exports = router;