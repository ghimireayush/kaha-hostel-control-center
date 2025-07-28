const fs = require('fs').promises;
const path = require('path');

// Path to data files
const PAYMENT_DATA_PATH = path.join(__dirname, '../data/payments.json');
const STUDENT_DATA_PATH = path.join(__dirname, '../data/students.json');
const INVOICE_DATA_PATH = path.join(__dirname, '../data/invoices.json');

/**
 * Read payment data from file
 * @returns {Promise<Array>} Array of payments
 */
async function readPaymentData() {
    try {
        const data = await fs.readFile(PAYMENT_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading payment data:', error);
        return [];
    }
}

/**
 * Write payment data to file
 * @param {Array} payments - Array of payments
 * @returns {Promise<void>}
 */
async function writePaymentData(payments) {
    try {
        await fs.writeFile(PAYMENT_DATA_PATH, JSON.stringify(payments, null, 2));
    } catch (error) {
        console.error('Error writing payment data:', error);
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
 * Get all payments with filtering and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated payment results
 */
async function getAllPayments(filters = {}) {
    const payments = await readPaymentData();
    const students = await readStudentData();
    
    // Create a student lookup map for performance
    const studentMap = students.reduce((map, student) => {
        map[student.id] = student;
        return map;
    }, {});
    
    // Enrich payments with student data
    let enrichedPayments = payments.map(payment => ({
        ...payment,
        studentName: studentMap[payment.studentId]?.name || 'Unknown Student',
        studentPhone: studentMap[payment.studentId]?.phone || '',
        roomNumber: studentMap[payment.studentId]?.roomNumber || ''
    }));
    
    // Apply filters
    if (filters.studentId) {
        enrichedPayments = enrichedPayments.filter(payment => 
            payment.studentId === filters.studentId
        );
    }
    
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        enrichedPayments = enrichedPayments.filter(payment => 
            payment.paymentMethod.toLowerCase() === filters.paymentMethod.toLowerCase()
        );
    }
    
    if (filters.dateFrom) {
        enrichedPayments = enrichedPayments.filter(payment => 
            new Date(payment.paymentDate) >= new Date(filters.dateFrom)
        );
    }
    
    if (filters.dateTo) {
        enrichedPayments = enrichedPayments.filter(payment => 
            new Date(payment.paymentDate) <= new Date(filters.dateTo)
        );
    }
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        enrichedPayments = enrichedPayments.filter(payment => 
            payment.studentName.toLowerCase().includes(searchLower) ||
            payment.studentPhone.includes(searchLower) ||
            payment.roomNumber.toLowerCase().includes(searchLower) ||
            payment.id.toLowerCase().includes(searchLower) ||
            payment.reference.toLowerCase().includes(searchLower)
        );
    }
    
    // Sort by payment date (newest first)
    enrichedPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedPayments = enrichedPayments.slice(startIndex, endIndex);
    
    return {
        items: paginatedPayments,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(enrichedPayments.length / limit),
            totalItems: enrichedPayments.length,
            itemsPerPage: limit
        }
    };
}/**
 *
 Get payment statistics
 * @returns {Promise<Object>} Payment statistics
 */
async function getPaymentStats() {
    const payments = await readPaymentData();
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filter payments for current month
    const thisMonthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
    });
    
    // Filter payments for today
    const todayPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.toDateString() === currentDate.toDateString();
    });
    
    // Calculate payment method distribution
    const paymentMethods = {};
    payments.forEach(payment => {
        paymentMethods[payment.paymentMethod] = (paymentMethods[payment.paymentMethod] || 0) + 1;
    });
    
    const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
        monthlyPayments: thisMonthPayments.length,
        monthlyAmount: thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0),
        todayPayments: todayPayments.length,
        todayAmount: todayPayments.reduce((sum, payment) => sum + payment.amount, 0),
        averagePayment: payments.length > 0 ? Math.round(payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length) : 0,
        paymentMethods: paymentMethods,
        recentPayments: payments
            .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
            .slice(0, 5)
    };
    
    return stats;
}

/**
 * Get payment by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object|null>} Payment object or null
 */
async function getPaymentById(paymentId) {
    const payments = await readPaymentData();
    const students = await readStudentData();
    
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return null;
    
    // Enrich with student data
    const student = students.find(s => s.id === payment.studentId);
    
    return {
        ...payment,
        studentName: student?.name || 'Unknown Student',
        studentPhone: student?.phone || '',
        studentEmail: student?.email || '',
        roomNumber: student?.roomNumber || ''
    };
}

/**
 * Get payments by student ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Array of payments
 */
async function getPaymentsByStudentId(studentId) {
    const payments = await readPaymentData();
    const students = await readStudentData();
    
    const studentPayments = payments.filter(p => p.studentId === studentId);
    const student = students.find(s => s.id === studentId);
    
    return studentPayments.map(payment => ({
        ...payment,
        studentName: student?.name || 'Unknown Student',
        studentPhone: student?.phone || '',
        roomNumber: student?.roomNumber || ''
    })).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
}

/**
 * Record new payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Created payment
 */
async function recordPayment(paymentData) {
    const payments = await readPaymentData();
    const students = await readStudentData();
    const invoices = await readInvoiceData();
    
    // Validate student exists
    const student = students.find(s => s.id === paymentData.studentId);
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }
    
    // Generate payment ID
    const paymentId = `PMT${Date.now()}`;
    
    const newPayment = {
        id: paymentId,
        studentId: paymentData.studentId,
        studentName: student.name,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        reference: paymentData.reference || `${paymentData.paymentMethod}-${Date.now()}`,
        notes: paymentData.notes || '',
        createdBy: paymentData.createdBy || 'admin',
        createdAt: new Date().toISOString(),
        invoiceIds: paymentData.invoiceIds || [],
        status: 'Completed'
    };
    
    // If specific invoices are provided, allocate payment to them
    if (paymentData.invoiceIds && paymentData.invoiceIds.length > 0) {
        await allocatePaymentToInvoicesInternal(newPayment, paymentData.invoiceIds, invoices);
    }
    
    payments.push(newPayment);
    await writePaymentData(payments);
    
    // Update invoice data if modified
    if (paymentData.invoiceIds && paymentData.invoiceIds.length > 0) {
        await writeInvoiceData(invoices);
    }
    
    return newPayment;
}

/**
 * Update payment
 * @param {string} paymentId - Payment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated payment
 */
async function updatePayment(paymentId, updateData) {
    const payments = await readPaymentData();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }
    
    const updatedPayment = {
        ...payments[paymentIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    
    payments[paymentIndex] = updatedPayment;
    await writePaymentData(payments);
    
    return updatedPayment;
}/**
 * Proc
ess bulk payments
 * @param {Array} paymentsData - Array of payment data
 * @returns {Promise<Object>} Bulk processing result
 */
async function processBulkPayments(paymentsData) {
    const results = {
        successful: [],
        failed: [],
        totalProcessed: paymentsData.length
    };
    
    for (const paymentData of paymentsData) {
        try {
            const newPayment = await recordPayment(paymentData);
            results.successful.push({
                paymentId: newPayment.id,
                studentId: paymentData.studentId,
                amount: paymentData.amount
            });
        } catch (error) {
            results.failed.push({
                studentId: paymentData.studentId,
                amount: paymentData.amount,
                reason: error.message
            });
        }
    }
    
    return {
        ...results,
        successCount: results.successful.length,
        failedCount: results.failed.length
    };
}

/**
 * Allocate payment to invoices
 * @param {string} paymentId - Payment ID
 * @param {Array} invoiceAllocations - Array of {invoiceId, amount}
 * @returns {Promise<Object>} Allocation result
 */
async function allocatePaymentToInvoices(paymentId, invoiceAllocations) {
    const payments = await readPaymentData();
    const invoices = await readInvoiceData();
    
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }
    
    const totalAllocated = invoiceAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    if (totalAllocated > payment.amount) {
        const error = new Error('Total allocation exceeds payment amount');
        error.statusCode = 422;
        error.details = { 
            paymentAmount: payment.amount,
            totalAllocated: totalAllocated
        };
        throw error;
    }
    
    const results = {
        successful: [],
        failed: [],
        totalAllocated: 0
    };
    
    for (const allocation of invoiceAllocations) {
        try {
            const invoiceIndex = invoices.findIndex(inv => inv.id === allocation.invoiceId);
            if (invoiceIndex === -1) {
                results.failed.push({
                    invoiceId: allocation.invoiceId,
                    reason: 'Invoice not found'
                });
                continue;
            }
            
            const invoice = invoices[invoiceIndex];
            
            // Add payment to invoice
            if (!invoice.payments) invoice.payments = [];
            invoice.payments.push({
                id: payment.id,
                amount: allocation.amount,
                date: payment.paymentDate,
                method: payment.paymentMethod
            });
            
            // Update invoice totals
            invoice.paymentTotal = (invoice.paymentTotal || 0) + allocation.amount;
            invoice.balanceDue = invoice.total - invoice.paymentTotal;
            
            // Update invoice status
            if (invoice.balanceDue <= 0) {
                invoice.status = 'Paid';
            } else if (invoice.paymentTotal > 0) {
                invoice.status = 'Partially Paid';
            }
            
            invoices[invoiceIndex] = invoice;
            
            results.successful.push({
                invoiceId: allocation.invoiceId,
                amount: allocation.amount,
                newBalance: invoice.balanceDue
            });
            
            results.totalAllocated += allocation.amount;
            
        } catch (error) {
            results.failed.push({
                invoiceId: allocation.invoiceId,
                reason: error.message
            });
        }
    }
    
    // Update payment with invoice allocations
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    payments[paymentIndex].invoiceIds = invoiceAllocations.map(alloc => alloc.invoiceId);
    payments[paymentIndex].allocations = invoiceAllocations;
    
    // Save changes
    await writePaymentData(payments);
    await writeInvoiceData(invoices);
    
    return results;
}

/**
 * Internal function to allocate payment to invoices during payment creation
 * @param {Object} payment - Payment object
 * @param {Array} invoiceIds - Array of invoice IDs
 * @param {Array} invoices - Invoices array (passed by reference)
 */
async function allocatePaymentToInvoicesInternal(payment, invoiceIds, invoices) {
    let remainingAmount = payment.amount;
    
    for (const invoiceId of invoiceIds) {
        if (remainingAmount <= 0) break;
        
        const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
        if (invoiceIndex === -1) continue;
        
        const invoice = invoices[invoiceIndex];
        const amountToAllocate = Math.min(remainingAmount, invoice.balanceDue || invoice.total);
        
        if (amountToAllocate > 0) {
            // Add payment to invoice
            if (!invoice.payments) invoice.payments = [];
            invoice.payments.push({
                id: payment.id,
                amount: amountToAllocate,
                date: payment.paymentDate,
                method: payment.paymentMethod
            });
            
            // Update invoice totals
            invoice.paymentTotal = (invoice.paymentTotal || 0) + amountToAllocate;
            invoice.balanceDue = invoice.total - invoice.paymentTotal;
            
            // Update invoice status
            if (invoice.balanceDue <= 0) {
                invoice.status = 'Paid';
            } else if (invoice.paymentTotal > 0) {
                invoice.status = 'Partially Paid';
            }
            
            remainingAmount -= amountToAllocate;
        }
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