const paymentService = require('../services/paymentService');

/**
 * Get all payments with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllPayments(req, res, next) {
    try {
        const { 
            page = 1, 
            limit = 50, 
            studentId, 
            paymentMethod,
            dateFrom,
            dateTo,
            search 
        } = req.query;

        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            studentId,
            paymentMethod,
            dateFrom,
            dateTo,
            search
        };

        const result = await paymentService.getAllPayments(filters);

        res.status(200).json({
            status: 200,
            result: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get payment statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getPaymentStats(req, res, next) {
    try {
        const stats = await paymentService.getPaymentStats();
        res.status(200).json({
            status: 200,
            stats: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getPaymentById(req, res, next) {
    try {
        const { id } = req.params;
        const payment = await paymentService.getPaymentById(id);
        
        if (!payment) {
            const error = new Error('Payment not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get payments by student ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getPaymentsByStudentId(req, res, next) {
    try {
        const { studentId } = req.params;
        const payments = await paymentService.getPaymentsByStudentId(studentId);

        res.status(200).json({
            status: 200,
            data: payments
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Record new payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function recordPayment(req, res, next) {
    try {
        const paymentData = req.body;
        
        // Basic validation
        if (!paymentData.studentId || !paymentData.amount || !paymentData.paymentMethod) {
            const error = new Error('Student ID, amount, and payment method are required');
            error.statusCode = 422;
            error.details = {
                studentId: !paymentData.studentId ? 'Student ID is required' : undefined,
                amount: !paymentData.amount ? 'Amount is required' : undefined,
                paymentMethod: !paymentData.paymentMethod ? 'Payment method is required' : undefined
            };
            throw error;
        }

        if (paymentData.amount <= 0) {
            const error = new Error('Payment amount must be greater than zero');
            error.statusCode = 422;
            error.details = { amount: 'Amount must be greater than zero' };
            throw error;
        }

        const newPayment = await paymentService.recordPayment(paymentData);

        res.status(201).json({
            status: 201,
            data: newPayment
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updatePayment(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedPayment = await paymentService.updatePayment(id, updateData);

        res.status(200).json({
            status: 200,
            data: updatedPayment
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Process bulk payments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function processBulkPayments(req, res, next) {
    try {
        const { payments } = req.body;
        
        if (!payments || !Array.isArray(payments) || payments.length === 0) {
            const error = new Error('Payments array is required');
            error.statusCode = 422;
            error.details = { payments: 'Payments array is required and cannot be empty' };
            throw error;
        }

        const result = await paymentService.processBulkPayments(payments);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Allocate payment to invoices
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function allocatePaymentToInvoices(req, res, next) {
    try {
        const { id } = req.params;
        const { invoiceAllocations } = req.body;
        
        if (!invoiceAllocations || !Array.isArray(invoiceAllocations)) {
            const error = new Error('Invoice allocations array is required');
            error.statusCode = 422;
            error.details = { invoiceAllocations: 'Invoice allocations array is required' };
            throw error;
        }

        const result = await paymentService.allocatePaymentToInvoices(id, invoiceAllocations);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllPayments,
    getPaymentStats,
    getPaymentById,
    getPaymentsByStudentId,
    recordPayment,
    updatePayment,
    processBulkPayments,
    allocatePaymentToInvoices
};