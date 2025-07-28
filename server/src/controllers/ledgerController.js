const ledgerService = require('../services/ledgerService');

/**
 * Get all ledger entries with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllLedgerEntries(req, res, next) {
    try {
        const { 
            page = 1, 
            limit = 50, 
            studentId, 
            type,
            dateFrom,
            dateTo,
            search 
        } = req.query;

        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            studentId,
            type,
            dateFrom,
            dateTo,
            search
        };

        const result = await ledgerService.getAllLedgerEntries(filters);

        res.status(200).json({
            status: 200,
            result: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get ledger entries for a specific student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getStudentLedger(req, res, next) {
    try {
        const { studentId } = req.params;
        const entries = await ledgerService.getStudentLedger(studentId);

        res.status(200).json({
            status: 200,
            data: entries
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create new ledger entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createLedgerEntry(req, res, next) {
    try {
        const entryData = req.body;
        
        // Basic validation
        if (!entryData.studentId || !entryData.type || !entryData.description) {
            const error = new Error('Student ID, type, and description are required');
            error.statusCode = 422;
            error.details = {
                studentId: !entryData.studentId ? 'Student ID is required' : undefined,
                type: !entryData.type ? 'Entry type is required' : undefined,
                description: !entryData.description ? 'Description is required' : undefined
            };
            throw error;
        }

        // Validate that either debit or credit is provided
        if (!entryData.debit && !entryData.credit) {
            const error = new Error('Either debit or credit amount is required');
            error.statusCode = 422;
            error.details = { amount: 'Either debit or credit amount must be provided' };
            throw error;
        }

        const newEntry = await ledgerService.createLedgerEntry(entryData);

        res.status(201).json({
            status: 201,
            data: newEntry
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update ledger entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateLedgerEntry(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedEntry = await ledgerService.updateLedgerEntry(id, updateData);

        res.status(200).json({
            status: 200,
            data: updatedEntry
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get ledger statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getLedgerStats(req, res, next) {
    try {
        const stats = await ledgerService.getLedgerStats();
        res.status(200).json({
            status: 200,
            stats: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get student balance summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getStudentBalance(req, res, next) {
    try {
        const { studentId } = req.params;
        const balance = await ledgerService.getStudentBalance(studentId);

        res.status(200).json({
            status: 200,
            data: balance
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Generate ledger entries from invoices and payments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateLedgerEntries(req, res, next) {
    try {
        const options = req.body || {};
        const result = await ledgerService.generateLedgerEntries(options);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllLedgerEntries,
    getStudentLedger,
    createLedgerEntry,
    updateLedgerEntry,
    getLedgerStats,
    getStudentBalance,
    generateLedgerEntries
};