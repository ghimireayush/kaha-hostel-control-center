const invoiceService = require('../services/invoiceService');

/**
 * Get all invoices with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllInvoices(req, res, next) {
    try {
        const { 
            page = 1, 
            limit = 50, 
            status, 
            studentId, 
            month,
            search 
        } = req.query;

        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            studentId,
            month,
            search
        };

        const result = await invoiceService.getAllInvoices(filters);

        res.status(200).json({
            status: 200,
            result: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get invoice statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getInvoiceStats(req, res, next) {
    try {
        const stats = await invoiceService.getInvoiceStats();
        res.status(200).json({
            status: 200,
            stats: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get invoice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getInvoiceById(req, res, next) {
    try {
        const { id } = req.params;
        const invoice = await invoiceService.getInvoiceById(id);
        
        if (!invoice) {
            const error = new Error('Invoice not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            data: invoice
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create new invoice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createInvoice(req, res, next) {
    try {
        const invoiceData = req.body;
        
        // Basic validation
        if (!invoiceData.studentId || !invoiceData.month) {
            const error = new Error('Student ID and month are required');
            error.statusCode = 422;
            error.details = {
                studentId: !invoiceData.studentId ? 'Student ID is required' : undefined,
                month: !invoiceData.month ? 'Month is required' : undefined
            };
            throw error;
        }

        const newInvoice = await invoiceService.createInvoice(invoiceData);

        res.status(201).json({
            status: 201,
            data: newInvoice
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update invoice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateInvoice(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedInvoice = await invoiceService.updateInvoice(id, updateData);

        res.status(200).json({
            status: 200,
            data: updatedInvoice
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Generate monthly invoices for all active students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateMonthlyInvoices(req, res, next) {
    try {
        const { month, studentIds } = req.body;
        
        if (!month) {
            const error = new Error('Month is required');
            error.statusCode = 422;
            error.details = { month: 'Month is required (YYYY-MM format)' };
            throw error;
        }

        const result = await invoiceService.generateMonthlyInvoices(month, studentIds);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Send invoice to student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function sendInvoice(req, res, next) {
    try {
        const { id } = req.params;
        const { method = 'email' } = req.body;

        const result = await invoiceService.sendInvoice(id, method);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllInvoices,
    getInvoiceStats,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    generateMonthlyInvoices,
    sendInvoice
};