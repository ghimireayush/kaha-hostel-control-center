const analyticsService = require('../services/analyticsService');

/**
 * Get dashboard analytics data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getDashboardData(req, res, next) {
    try {
        // Currently no query parameters are defined in the blueprint for this endpoint
        // If needed later, they can be extracted like:
        // const { period = 'month' } = req.query;
        
        const dashboardData = await analyticsService.getDashboardData();
        
        res.status(200).json({
            status: 200,
            data: dashboardData
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDashboardData
};