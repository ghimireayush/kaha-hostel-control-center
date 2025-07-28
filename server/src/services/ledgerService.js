const fs = require('fs').promises;
const path = require('path');

// Path to data files
const LEDGER_DATA_PATH = path.join(__dirname, '../data/ledger.json');
const STUDENT_DATA_PATH = path.join(__dirname, '../data/students.json');
const INVOICE_DATA_PATH = path.join(__dirname, '../data/invoices.json');
const PAYMENT_DATA_PATH = path.join(__dirname, '../data/payments.json');

/**
 * Read ledger data from file
 * @returns {Promise<Array>} Array of ledger entries
 */
async function readLedgerData() {
    try {
        const data = await fs.readFile(LEDGER_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading ledger data:', error);
        return [];
    }
}

/**
 * Write ledger data to file
 * @param {Array} ledgerEntries - Array of ledger entries
 * @returns {Promise<void>}
 */
async function writeLedgerData(ledgerEntries) {
    try {
        await fs.writeFile(LEDGER_DATA_PATH, JSON.stringify(ledgerEntries, null, 2));
    } catch (error) {
        console.error('Error writing ledger data:', error);
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
 * Get all ledger entries with filtering and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated ledger results
 */
async function getAllLedgerEntries(filters = {}) {
    const ledgerEntries = await readLedgerData();
    const students = await readStudentData();
    
    // Create a student lookup map for performance
    const studentMap = students.reduce((map, student) => {
        map[student.id] = student;
        return map;
    }, {});
    
    // Enrich ledger entries with student data
    let enrichedEntries = ledgerEntries.map(entry => ({
        ...entry,
        studentName: studentMap[entry.studentId]?.name || 'Unknown Student',
        studentPhone: studentMap[entry.studentId]?.phone || '',
        roomNumber: studentMap[entry.studentId]?.roomNumber || ''
    }));
    
    // Apply filters
    if (filters.studentId) {
        enrichedEntries = enrichedEntries.filter(entry => 
            entry.studentId === filters.studentId
        );
    }
    
    if (filters.type && filters.type !== 'all') {
        enrichedEntries = enrichedEntries.filter(entry => 
            entry.type.toLowerCase() === filters.type.toLowerCase()
        );
    }
    
    if (filters.dateFrom) {
        enrichedEntries = enrichedEntries.filter(entry => 
            new Date(entry.date) >= new Date(filters.dateFrom)
        );
    }
    
    if (filters.dateTo) {
        enrichedEntries = enrichedEntries.filter(entry => 
            new Date(entry.date) <= new Date(filters.dateTo)
        );
    }
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        enrichedEntries = enrichedEntries.filter(entry => 
            entry.studentName.toLowerCase().includes(searchLower) ||
            entry.description.toLowerCase().includes(searchLower) ||
            entry.referenceId.toLowerCase().includes(searchLower) ||
            entry.id.toLowerCase().includes(searchLower)
        );
    }
    
    // Sort by date (newest first)
    enrichedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedEntries = enrichedEntries.slice(startIndex, endIndex);
    
    return {
        items: paginatedEntries,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(enrichedEntries.length / limit),
            totalItems: enrichedEntries.length,
            itemsPerPage: limit
        }
    };
}

/**
 * Get ledger entries for a specific student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Student's ledger entries
 */
async function getStudentLedger(studentId) {
    const ledgerEntries = await readLedgerData();
    const students = await readStudentData();
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }
    
    const studentEntries = ledgerEntries
        .filter(entry => entry.studentId === studentId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Enrich with student data
    const enrichedEntries = studentEntries.map(entry => ({
        ...entry,
        studentName: student.name,
        studentPhone: student.phone,
        roomNumber: student.roomNumber
    }));
    
    return enrichedEntries;
}

/**
 * Create new ledger entry
 * @param {Object} entryData - Ledger entry data
 * @returns {Promise<Object>} Created ledger entry
 */
async function createLedgerEntry(entryData) {
    const ledgerEntries = await readLedgerData();
    const students = await readStudentData();
    
    // Validate student exists
    const student = students.find(s => s.id === entryData.studentId);
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }
    
    // Generate ledger entry ID
    const entryId = `LED${Date.now()}`;
    
    // Calculate new balance
    const studentEntries = ledgerEntries.filter(entry => entry.studentId === entryData.studentId);
    const currentBalance = studentEntries.length > 0 
        ? studentEntries[studentEntries.length - 1].balance 
        : 0;
    
    const debit = entryData.debit || 0;
    const credit = entryData.credit || 0;
    const newBalance = currentBalance + debit - credit;
    
    const balanceType = newBalance > 0 ? 'Dr' : newBalance < 0 ? 'Cr' : 'Nil';
    
    const newEntry = {
        id: entryId,
        studentId: entryData.studentId,
        date: entryData.date || new Date().toISOString().split('T')[0],
        type: entryData.type,
        description: entryData.description,
        referenceId: entryData.referenceId || '',
        debit: debit,
        credit: credit,
        balance: newBalance,
        balanceType: balanceType,
        createdBy: entryData.createdBy || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    ledgerEntries.push(newEntry);
    await writeLedgerData(ledgerEntries);
    
    return newEntry;
}/*
*
 * Update ledger entry
 * @param {string} entryId - Ledger entry ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated ledger entry
 */
async function updateLedgerEntry(entryId, updateData) {
    const ledgerEntries = await readLedgerData();
    const entryIndex = ledgerEntries.findIndex(entry => entry.id === entryId);
    
    if (entryIndex === -1) {
        const error = new Error('Ledger entry not found');
        error.statusCode = 404;
        throw error;
    }
    
    const updatedEntry = {
        ...ledgerEntries[entryIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    
    // Recalculate balance if debit/credit changed
    if (updateData.debit !== undefined || updateData.credit !== undefined) {
        const studentEntries = ledgerEntries.filter(entry => 
            entry.studentId === updatedEntry.studentId && entry.id !== entryId
        );
        
        // Sort by date to get previous balance
        studentEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
        const previousBalance = studentEntries.length > 0 
            ? studentEntries[studentEntries.length - 1].balance 
            : 0;
        
        const newBalance = previousBalance + (updatedEntry.debit || 0) - (updatedEntry.credit || 0);
        updatedEntry.balance = newBalance;
        updatedEntry.balanceType = newBalance > 0 ? 'Dr' : newBalance < 0 ? 'Cr' : 'Nil';
    }
    
    ledgerEntries[entryIndex] = updatedEntry;
    await writeLedgerData(ledgerEntries);
    
    return updatedEntry;
}

/**
 * Get ledger statistics
 * @returns {Promise<Object>} Ledger statistics
 */
async function getLedgerStats() {
    const ledgerEntries = await readLedgerData();
    const students = await readStudentData();
    
    const stats = {
        totalEntries: ledgerEntries.length,
        totalDebits: 0,
        totalCredits: 0,
        studentsWithBalance: 0,
        studentsWithCredit: 0,
        studentsWithDebit: 0,
        recentEntries: [],
        entryTypes: {},
        monthlyTrends: {}
    };
    
    // Calculate totals and entry types
    ledgerEntries.forEach(entry => {
        stats.totalDebits += entry.debit || 0;
        stats.totalCredits += entry.credit || 0;
        
        // Count entry types
        stats.entryTypes[entry.type] = (stats.entryTypes[entry.type] || 0) + 1;
        
        // Monthly trends
        const month = entry.date.substring(0, 7); // YYYY-MM
        if (!stats.monthlyTrends[month]) {
            stats.monthlyTrends[month] = { debits: 0, credits: 0, count: 0 };
        }
        stats.monthlyTrends[month].debits += entry.debit || 0;
        stats.monthlyTrends[month].credits += entry.credit || 0;
        stats.monthlyTrends[month].count += 1;
    });
    
    // Calculate student balance statistics
    const studentBalances = {};
    ledgerEntries.forEach(entry => {
        if (!studentBalances[entry.studentId]) {
            studentBalances[entry.studentId] = 0;
        }
        studentBalances[entry.studentId] += (entry.debit || 0) - (entry.credit || 0);
    });
    
    Object.values(studentBalances).forEach(balance => {
        if (balance > 0) stats.studentsWithDebit++;
        else if (balance < 0) stats.studentsWithCredit++;
        else stats.studentsWithBalance++;
    });
    
    // Get recent entries (last 10)
    stats.recentEntries = ledgerEntries
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    
    stats.outstandingAmount = Object.values(studentBalances)
        .filter(balance => balance > 0)
        .reduce((sum, balance) => sum + balance, 0);
    
    stats.advanceAmount = Math.abs(Object.values(studentBalances)
        .filter(balance => balance < 0)
        .reduce((sum, balance) => sum + balance, 0));
    
    return stats;
}

/**
 * Get student balance summary
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Student balance summary
 */
async function getStudentBalance(studentId) {
    const ledgerEntries = await readLedgerData();
    const students = await readStudentData();
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        const error = new Error('Student not found');
        error.statusCode = 404;
        throw error;
    }
    
    const studentEntries = ledgerEntries.filter(entry => entry.studentId === studentId);
    
    let totalDebits = 0;
    let totalCredits = 0;
    let lastEntry = null;
    
    studentEntries.forEach(entry => {
        totalDebits += entry.debit || 0;
        totalCredits += entry.credit || 0;
        if (!lastEntry || new Date(entry.date) > new Date(lastEntry.date)) {
            lastEntry = entry;
        }
    });
    
    const currentBalance = totalDebits - totalCredits;
    const balanceType = currentBalance > 0 ? 'Dr' : currentBalance < 0 ? 'Cr' : 'Nil';
    
    return {
        studentId: studentId,
        studentName: student.name,
        roomNumber: student.roomNumber,
        totalDebits: totalDebits,
        totalCredits: totalCredits,
        currentBalance: Math.abs(currentBalance),
        balanceType: balanceType,
        rawBalance: currentBalance,
        entryCount: studentEntries.length,
        lastEntryDate: lastEntry ? lastEntry.date : null,
        lastEntryType: lastEntry ? lastEntry.type : null
    };
}

/**
 * Generate ledger entries from invoices and payments
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generation result
 */
async function generateLedgerEntries(options = {}) {
    const invoices = await readInvoiceData();
    const payments = await readPaymentData();
    const ledgerEntries = await readLedgerData();
    
    const results = {
        invoiceEntries: [],
        paymentEntries: [],
        skipped: [],
        errors: []
    };
    
    // Generate entries from invoices
    for (const invoice of invoices) {
        try {
            // Check if entry already exists
            const existingEntry = ledgerEntries.find(entry => 
                entry.referenceId === invoice.id && entry.type === 'Invoice'
            );
            
            if (existingEntry) {
                results.skipped.push({
                    type: 'Invoice',
                    referenceId: invoice.id,
                    reason: 'Entry already exists'
                });
                continue;
            }
            
            const entryData = {
                studentId: invoice.studentId,
                date: invoice.createdAt.split('T')[0],
                type: 'Invoice',
                description: `Invoice ${invoice.id} - ${invoice.month}`,
                referenceId: invoice.id,
                debit: invoice.total,
                credit: 0,
                createdBy: 'system'
            };
            
            const newEntry = await createLedgerEntry(entryData);
            results.invoiceEntries.push(newEntry);
            
        } catch (error) {
            results.errors.push({
                type: 'Invoice',
                referenceId: invoice.id,
                error: error.message
            });
        }
    }
    
    // Generate entries from payments
    for (const payment of payments) {
        try {
            // Check if entry already exists
            const existingEntry = ledgerEntries.find(entry => 
                entry.referenceId === payment.id && entry.type === 'Payment'
            );
            
            if (existingEntry) {
                results.skipped.push({
                    type: 'Payment',
                    referenceId: payment.id,
                    reason: 'Entry already exists'
                });
                continue;
            }
            
            const entryData = {
                studentId: payment.studentId,
                date: payment.paymentDate,
                type: 'Payment',
                description: `Payment ${payment.id} - ${payment.paymentMethod}`,
                referenceId: payment.id,
                debit: 0,
                credit: payment.amount,
                createdBy: 'system'
            };
            
            const newEntry = await createLedgerEntry(entryData);
            results.paymentEntries.push(newEntry);
            
        } catch (error) {
            results.errors.push({
                type: 'Payment',
                referenceId: payment.id,
                error: error.message
            });
        }
    }
    
    return {
        ...results,
        totalGenerated: results.invoiceEntries.length + results.paymentEntries.length,
        totalSkipped: results.skipped.length,
        totalErrors: results.errors.length
    };
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