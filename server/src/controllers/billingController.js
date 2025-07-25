const billingService = require('../services/billingService');

/**
 * Get all invoices with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllInvoices(req, res, next) {
    try {
        // Extract query parameters with defaults
        const { studentId = null, status = 'all', month = null, page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || pageNum < 1) {
            const error = new Error('Invalid page number');
            error.statusCode = 422;
            error.details = { page: 'Page must be a positive integer' };
            throw error;
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            const error = new Error('Invalid limit');
            error.statusCode = 422;
            error.details = { limit: 'Limit must be a positive integer between 1 and 100' };
            throw error;
        }

        const result = await billingService.getAllInvoices({
            studentId,
            status,
            month,
            page: pageNum,
            limit: limitNum
        });

        res.status(200).json({
            status: 200,
            result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a single invoice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getInvoiceById(req, res, next) {
    try {
        const { id } = req.params;
        const invoice = await billingService.getInvoiceById(id);

        if (!invoice) {
            const error = new Error('Invoice not found');
            error.statusCode = 404;
            throw error;
        }

        // Return the full detailed invoice structure as per the blueprint
        res.status(200).json({
            status: 200,
            invoice // 'data' object is the invoice itself in the blueprint example
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all payments with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllPayments(req, res, next) {
    try {
        // Extract query parameters with defaults
        const { studentId = null, startDate = null, endDate = null, paymentMethod = 'all', page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || pageNum < 1) {
            const error = new Error('Invalid page number');
            error.statusCode = 422;
            error.details = { page: 'Page must be a positive integer' };
            throw error;
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            const error = new Error('Invalid limit');
            error.statusCode = 422;
            error.details = { limit: 'Limit must be a positive integer between 1 and 100' };
            throw error;
        }

        const result = await billingService.getAllPayments({
            studentId,
            startDate,
            endDate,
            paymentMethod,
            page: pageNum,
            limit: limitNum
        });

        res.status(200).json({
            status: 200,
            result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllInvoices,
    getInvoiceById,
    getAllPayments
};
