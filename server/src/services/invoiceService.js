const fs = require('fs').promises;
const path = require('path');

// Path to invoice data file
const INVOICE_DATA_PATH = path.join(__dirname, '../data/invoices.json');
const STUDENT_DATA_PATH = path.join(__dirname, '../data/students.json');

/**
 * Read invoice data from file
 * @returns {Promise<Array>} Array of invoices
 */
async function readInvoiceData() {
    try {
        const data = await fs.readFile(INVOICE_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading invoice data:', error);
        return [];
    }
}

/**
 * Write invoice data to file
 * @param {Array} invoices - Array of invoices
 * @returns {Promise<void>}
 */
async function writeInvoiceData(invoices) {
    try {
        await fs.writeFile(INVOICE_DATA_PATH, JSON.stringify(invoices, null, 2));
    } catch (error) {
        console.error('Error writing invoice data:', error);
        throw error;
    }
}

/**
 * Read student data from file
 * @returns {Promise<Array>} Array of students
 */
async function readStudentData() {
    try {
        const data = await fs.readFile(STUDENT_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading student data:', error);
        return [];
    }
}

/**
 * Get all invoices with filtering and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated invoice results
 */
async function getAllInvoices(filters = {}) {
    const invoices = await readInvoiceData();
    const students = await readStudentData();
    
    // Create a student lookup map for performance
    const studentMap = students.reduce((map, student) => {
        map[student.id] = student;
        return map;
    }, {});
    
    // Enrich invoices with student data
    let enrichedInvoices = invoices.map(invoice => ({
        ...invoice,
        studentName: studentMap[invoice.studentId]?.name || 'Unknown Student',
        studentPhone: studentMap[invoice.studentId]?.phone || '',
        roomNumber: studentMap[invoice.studentId]?.roomNumber || ''
    }));
    
    // Apply filters
    if (filters.status && filters.status !== 'all') {
        enrichedInvoices = enrichedInvoices.filter(invoice => 
            invoice.status.toLowerCase() === filters.status.toLowerCase()
        );
    }
    
    if (filters.studentId) {
        enrichedInvoices = enrichedInvoices.filter(invoice => 
            invoice.studentId === filters.studentId
        );
    }
    
    if (filters.month) {
        enrichedInvoices = enrichedInvoices.filter(invoice => 
            invoice.month === filters.month
        );
    }
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        enrichedInvoices = enrichedInvoices.filter(invoice => 
            invoice.studentName.toLowerCase().includes(searchLower) ||
            invoice.studentPhone.includes(searchLower) ||
            invoice.roomNumber.toLowerCase().includes(searchLower) ||
            invoice.id.toLowerCase().includes(searchLower)
        );
    }
    
    // Sort by creation date (newest first)
    enrichedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedInvoices = enrichedInvoices.slice(startIndex, endIndex);
    
    return {
        items: paginatedInvoices,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(enrichedInvoices.length / limit),
            totalItems: enrichedInvoices.length,
            itemsPerPage: limit
        }
    };
}

/**
 * Get invoice statistics
 * @returns {Promise<Object>} Invoice statistics
 */
async function getInvoiceStats() {
    const invoices = await readInvoiceData();
    
    const stats = {
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === 'Paid').length,
        unpaidInvoices: invoices.filter(inv => inv.status === 'Unpaid').length,
        partiallyPaidInvoices: invoices.filter(inv => inv.status === 'Partially Paid').length,
        overdueInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0
    };
    
    // Calculate amounts and overdue invoices
    const currentDate = new Date();
    invoices.forEach(invoice => {
        stats.totalAmount += invoice.total || 0;
        
        if (invoice.status === 'Paid') {
            stats.paidAmount += invoice.total || 0;
        } else {
            stats.outstandingAmount += invoice.total || 0;
            
            // Check if overdue (due date passed)
            if (invoice.dueDate && new Date(invoice.dueDate) < currentDate) {
                stats.overdueInvoices++;
            }
        }
    });
    
    // Calculate collection rate
    stats.collectionRate = stats.totalAmount > 0 
        ? Math.round((stats.paidAmount / stats.totalAmount) * 100) 
        : 0;
    
    return stats;
}

/**
 * Get invoice by ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object|null>} Invoice object or null
 */
async function getInvoiceById(invoiceId) {
    const invoices = await readInvoiceData();
    const students = await readStudentData();
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return null;
    
    // Enrich with student data
    const student = students.find(s => s.id === invoice.studentId);
    
    return {
        ...invoice,
        studentName: student?.name || 'Unknown Student',
        studentPhone: student?.phone || '',
        studentEmail: student?.email || '',
        roomNumber: student?.roomNumber || ''
    };
}

/**
 * Create new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
async function createInvoice(invoiceData) {
    const invoices = await readInvoiceData();
    const students = await readStudentData();
    
    // Validate student exists
    const student = students.find(s => s.id === invoiceData.studentId);
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }
    
    // Check if invoice already exists for this student and month
    const existingInvoice = invoices.find(inv => 
        inv.studentId === invoiceData.studentId && inv.month === invoiceData.month
    );
    
    if (existingInvoice) {
        const error = new Error('Invoice already exists for this student and month');
        error.statusCode = 422;
        error.details = { month: 'Invoice already exists for this month' };
        throw error;
    }
    
    // Generate invoice ID
    const invoiceId = `INV${Date.now()}`;
    
    // Calculate due date (15 days from creation)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    
    // Create invoice items based on student fees
    const items = [];
    let total = 0;
    
    if (student.baseMonthlyFee) {
        items.push({
            id: `ITEM${Date.now()}1`,
            description: `Room Rent - ${student.roomNumber}`,
            amount: student.baseMonthlyFee,
            category: 'Accommodation'
        });
        total += student.baseMonthlyFee;
    }
    
    if (student.laundryFee) {
        items.push({
            id: `ITEM${Date.now()}2`,
            description: 'Laundry Service',
            amount: student.laundryFee,
            category: 'Services'
        });
        total += student.laundryFee;
    }
    
    if (student.foodFee) {
        items.push({
            id: `ITEM${Date.now()}3`,
            description: 'Food Service',
            amount: student.foodFee,
            category: 'Services'
        });
        total += student.foodFee;
    }
    
    const newInvoice = {
        id: invoiceId,
        studentId: invoiceData.studentId,
        studentName: student.name,
        roomNumber: student.roomNumber,
        month: invoiceData.month,
        total: total,
        status: 'Unpaid',
        dueDate: dueDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        items: items,
        payments: [],
        discounts: [],
        subtotal: total,
        discountTotal: 0,
        paymentTotal: 0,
        balanceDue: total,
        notes: invoiceData.notes || ''
    };
    
    invoices.push(newInvoice);
    await writeInvoiceData(invoices);
    
    return newInvoice;
}

/**
 * Update invoice
 * @param {string} invoiceId - Invoice ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated invoice
 */
async function updateInvoice(invoiceId, updateData) {
    const invoices = await readInvoiceData();
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) {
        const error = new Error('Invoice not found');
        error.statusCode = 404;
        throw error;
    }
    
    const updatedInvoice = {
        ...invoices[invoiceIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    
    invoices[invoiceIndex] = updatedInvoice;
    await writeInvoiceData(invoices);
    
    return updatedInvoice;
}

/**
 * Generate monthly invoices for active students
 * @param {string} month - Month in YYYY-MM format
 * @param {Array} studentIds - Optional array of specific student IDs
 * @returns {Promise<Object>} Generation result
 */
async function generateMonthlyInvoices(month, studentIds = null) {
    const students = await readStudentData();
    const invoices = await readInvoiceData();
    
    // Filter active students
    let targetStudents = students.filter(student => student.status === 'Active');
    
    // If specific student IDs provided, filter further
    if (studentIds && Array.isArray(studentIds)) {
        targetStudents = targetStudents.filter(student => studentIds.includes(student.id));
    }
    
    const results = {
        successful: [],
        failed: [],
        skipped: []
    };
    
    for (const student of targetStudents) {
        try {
            // Check if invoice already exists
            const existingInvoice = invoices.find(inv => 
                inv.studentId === student.id && inv.month === month
            );
            
            if (existingInvoice) {
                results.skipped.push({
                    studentId: student.id,
                    studentName: student.name,
                    reason: 'Invoice already exists'
                });
                continue;
            }
            
            // Create invoice
            const newInvoice = await createInvoice({
                studentId: student.id,
                month: month
            });
            
            results.successful.push({
                studentId: student.id,
                studentName: student.name,
                invoiceId: newInvoice.id,
                amount: newInvoice.total
            });
            
        } catch (error) {
            results.failed.push({
                studentId: student.id,
                studentName: student.name,
                reason: error.message
            });
        }
    }
    
    return {
        ...results,
        totalProcessed: targetStudents.length,
        successCount: results.successful.length,
        failedCount: results.failed.length,
        skippedCount: results.skipped.length,
        month: month
    };
}

/**
 * Send invoice to student
 * @param {string} invoiceId - Invoice ID
 * @param {string} method - Sending method (email, sms, etc.)
 * @returns {Promise<Object>} Send result
 */
async function sendInvoice(invoiceId, method = 'email') {
    const invoice = await getInvoiceById(invoiceId);
    
    if (!invoice) {
        const error = new Error('Invoice not found');
        error.statusCode = 404;
        throw error;
    }
    
    // Simulate sending invoice (in real app, integrate with email/SMS service)
    const sendResult = {
        invoiceId: invoiceId,
        studentId: invoice.studentId,
        studentName: invoice.studentName,
        method: method,
        sentAt: new Date().toISOString(),
        status: 'sent',
        message: `Invoice sent successfully via ${method}`
    };
    
    // Update invoice with sent status
    await updateInvoice(invoiceId, {
        lastSentAt: sendResult.sentAt,
        lastSentMethod: method
    });
    
    return sendResult;
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