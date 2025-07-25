const fs = require('fs').promises;
const path = require('path');

// Path to the data files
const invoicesDataPath = path.join(__dirname, '../data/invoices.json');
const paymentsDataPath = path.join(__dirname, '../data/payments.json');

// Helper function to read invoice data from file
async function readInvoiceData() {
    try {
        const data = await fs.readFile(invoicesDataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading invoice data:', error);
        throw new Error('Failed to read invoice data');
    }
}

// Helper function to read payment data from file
async function readPaymentData() {
    try {
        const data = await fs.readFile(paymentsDataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading payment data:', error);
        throw new Error('Failed to read payment data');
    }
}

// Helper function to write invoice data to file
async function writeInvoiceData(invoices) {
    try {
        await fs.writeFile(invoicesDataPath, JSON.stringify(invoices, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing invoice data:', error);
        throw new Error('Failed to write invoice data');
    }
}

// Helper function to write payment data to file
async function writePaymentData(payments) {
    try {
        await fs.writeFile(paymentsDataPath, JSON.stringify(payments, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing payment data:', error);
        throw new Error('Failed to write payment data');
    }
}

/**
 * Get all invoices with optional filtering and pagination
 * @param {Object} options - Filter and pagination options
 * @param {string} options.studentId - Filter by student ID
 * @param {string} options.status - Filter by status ('all', 'Paid', 'Unpaid', 'Partially Paid')
 * @param {string} options.month - Filter by month (YYYY-MM format)
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of items per page
 * @returns {Promise<Object>} Paginated invoices and pagination info
 */
async function getAllInvoices({ studentId = null, status = 'all', month = null, page = 1, limit = 50 }) {
    const invoices = await readInvoiceData();
    let filteredInvoices = [...invoices];

    // Apply filters
    if (studentId) {
        filteredInvoices = filteredInvoices.filter(inv => inv.studentId === studentId);
    }
    if (status !== 'all') {
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(' ', '');
        filteredInvoices = filteredInvoices.filter(inv => inv.status === normalizedStatus);
    }
    if (month) {
        filteredInvoices = filteredInvoices.filter(inv => inv.month === month); // Assumes YYYY-MM format
    }

    // Apply pagination
    const totalItems = filteredInvoices.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit);

    return {
        items: paginatedInvoices,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit, 10)
        }
    };
}

/**
 * Get a single invoice by ID
 * @param {string} id - Invoice ID
 * @returns {Promise<Object|null>} Invoice object or null if not found
 */
async function getInvoiceById(id) {
    const invoices = await readInvoiceData();
    const invoice = invoices.find(inv => inv.id === id);
    return invoice || null;
}

/**
 * Get all payments with optional filtering and pagination
 * @param {Object} options - Filter and pagination options
 * @param {string} options.studentId - Filter by student ID
 * @param {string} options.startDate - Filter by start date (YYYY-MM-DD format)
 * @param {string} options.endDate - Filter by end date (YYYY-MM-DD format)
 * @param {string} options.paymentMethod - Filter by payment method ('all', 'Cash', 'Bank Transfer', etc.)
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of items per page
 * @returns {Promise<Object>} Paginated payments, pagination info, and summary
 */
async function getAllPayments({ studentId = null, startDate = null, endDate = null, paymentMethod = 'all', page = 1, limit = 50 }) {
    const payments = await readPaymentData();
    let filteredPayments = [...payments];

    // Apply filters
    if (studentId) {
        filteredPayments = filteredPayments.filter(p => p.studentId === studentId);
    }
    if (startDate) {
        const start = new Date(startDate);
        filteredPayments = filteredPayments.filter(p => new Date(p.paymentDate) >= start);
    }
    if (endDate) {
        const end = new Date(endDate);
        filteredPayments = filteredPayments.filter(p => new Date(p.paymentDate) <= end);
    }
    if (paymentMethod !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.paymentMethod.toLowerCase() === paymentMethod.toLowerCase());
    }

    // Apply pagination
    const totalItems = filteredPayments.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + limit);

    // Mock summary calculation
    const totalPayments = filteredPayments.length;
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
        items: paginatedPayments,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit, 10)
        },
        summary: {
            totalPayments,
            totalAmount
        }
    };
}

module.exports = {
    getAllInvoices,
    getInvoiceById,
    getAllPayments
};
