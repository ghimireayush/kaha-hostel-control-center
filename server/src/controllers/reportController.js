const reportService = require('../services/reportService');

/**
 * Get all reports with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllReports(req, res, next) {
    try {
        const { 
            page = 1, 
            limit = 50, 
            type, 
            status,
            generatedBy,
            dateFrom,
            dateTo,
            search 
        } = req.query;

        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            type,
            status,
            generatedBy,
            dateFrom,
            dateTo,
            search
        };

        const result = await reportService.getAllReports(filters);

        res.status(200).json({
            status: 200,
            result: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get report by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getReportById(req, res, next) {
    try {
        const { id } = req.params;
        const report = await reportService.getReportById(id);
        
        if (!report) {
            const error = new Error('Report not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            data: report
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Generate new report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateReport(req, res, next) {
    try {
        const reportData = req.body;
        
        // Basic validation
        if (!reportData.name || !reportData.type) {
            const error = new Error('Report name and type are required');
            error.statusCode = 422;
            error.details = {
                name: !reportData.name ? 'Report name is required' : undefined,
                type: !reportData.type ? 'Report type is required' : undefined
            };
            throw error;
        }

        const newReport = await reportService.generateReport(reportData);

        res.status(201).json({
            status: 201,
            data: newReport
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get report statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getReportStats(req, res, next) {
    try {
        const stats = await reportService.getReportStats();
        res.status(200).json({
            status: 200,
            stats: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get available report types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getReportTypes(req, res, next) {
    try {
        const types = await reportService.getReportTypes();
        res.status(200).json({
            status: 200,
            data: types
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Schedule recurring report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function scheduleReport(req, res, next) {
    try {
        const scheduleData = req.body;
        
        // Basic validation
        if (!scheduleData.name || !scheduleData.type || !scheduleData.scheduleConfig) {
            const error = new Error('Report name, type, and schedule configuration are required');
            error.statusCode = 422;
            error.details = {
                name: !scheduleData.name ? 'Report name is required' : undefined,
                type: !scheduleData.type ? 'Report type is required' : undefined,
                scheduleConfig: !scheduleData.scheduleConfig ? 'Schedule configuration is required' : undefined
            };
            throw error;
        }

        const scheduledReport = await reportService.scheduleReport(scheduleData);

        res.status(201).json({
            status: 201,
            data: scheduledReport
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get report download information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getReportDownload(req, res, next) {
    try {
        const { id } = req.params;
        const downloadInfo = await reportService.getReportDownloadInfo(id);

        res.status(200).json({
            status: 200,
            data: downloadInfo
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deleteReport(req, res, next) {
    try {
        const { id } = req.params;
        const deletedReport = await reportService.deleteReport(id);

        res.status(200).json({
            status: 200,
            data: deletedReport,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllReports,
    getReportById,
    generateReport,
    getReportStats,
    getReportTypes,
    scheduleReport,
    getReportDownload,
    deleteReport
};