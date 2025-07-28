const fs = require('fs').promises;
const path = require('path');

// Path to data files
const REPORTS_DATA_PATH = path.join(__dirname, '../data/reports.json');
const STUDENT_DATA_PATH = path.join(__dirname, '../data/students.json');
const INVOICE_DATA_PATH = path.join(__dirname, '../data/invoices.json');
const PAYMENT_DATA_PATH = path.join(__dirname, '../data/payments.json');
const LEDGER_DATA_PATH = path.join(__dirname, '../data/ledger.json');

/**
 * Read reports data from file
 * @returns {Promise<Array>} Array of reports
 */
async function readReportsData() {
    try {
        const data = await fs.readFile(REPORTS_DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading reports data:', error);
        return [];
    }
}

/**
 * Write reports data to file
 * @param {Array} reports - Array of reports
 * @returns {Promise<void>}
 */
async function writeReportsData(reports) {
    try {
        await fs.writeFile(REPORTS_DATA_PATH, JSON.stringify(reports, null, 2));
    } catch (error) {
        console.error('Error writing reports data:', error);
        throw error;
    }
}

/**
 * Read data from various sources for report generation
 */
async function readDataSources() {
    try {
        const [students, invoices, payments, ledger] = await Promise.all([
            fs.readFile(STUDENT_DATA_PATH, 'utf8').then(data => JSON.parse(data)).catch(() => []),
            fs.readFile(INVOICE_DATA_PATH, 'utf8').then(data => JSON.parse(data)).catch(() => []),
            fs.readFile(PAYMENT_DATA_PATH, 'utf8').then(data => JSON.parse(data)).catch(() => []),
            fs.readFile(LEDGER_DATA_PATH, 'utf8').then(data => JSON.parse(data)).catch(() => [])
        ]);
        
        return { students, invoices, payments, ledger };
    } catch (error) {
        console.error('Error reading data sources:', error);
        return { students: [], invoices: [], payments: [], ledger: [] };
    }
}

/**
 * Get all reports with filtering and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated reports results
 */
async function getAllReports(filters = {}) {
    const reports = await readReportsData();
    
    let filteredReports = [...reports];
    
    // Apply filters
    if (filters.type && filters.type !== 'all') {
        filteredReports = filteredReports.filter(report => 
            report.type.toLowerCase() === filters.type.toLowerCase()
        );
    }
    
    if (filters.status && filters.status !== 'all') {
        filteredReports = filteredReports.filter(report => 
            report.status.toLowerCase() === filters.status.toLowerCase()
        );
    }
    
    if (filters.generatedBy) {
        filteredReports = filteredReports.filter(report => 
            report.generatedBy === filters.generatedBy
        );
    }
    
    if (filters.dateFrom) {
        filteredReports = filteredReports.filter(report => 
            new Date(report.generatedAt) >= new Date(filters.dateFrom)
        );
    }
    
    if (filters.dateTo) {
        filteredReports = filteredReports.filter(report => 
            new Date(report.generatedAt) <= new Date(filters.dateTo)
        );
    }
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredReports = filteredReports.filter(report => 
            report.name.toLowerCase().includes(searchLower) ||
            report.description.toLowerCase().includes(searchLower) ||
            report.type.toLowerCase().includes(searchLower)
        );
    }
    
    // Sort by generation date (newest first)
    filteredReports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    
    return {
        items: paginatedReports,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredReports.length / limit),
            totalItems: filteredReports.length,
            itemsPerPage: limit
        }
    };
}

/**
 * Get report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise<Object|null>} Report object or null
 */
async function getReportById(reportId) {
    const reports = await readReportsData();
    return reports.find(report => report.id === reportId) || null;
}

/**
 * Generate new report
 * @param {Object} reportData - Report generation parameters
 * @returns {Promise<Object>} Generated report
 */
async function generateReport(reportData) {
    const reports = await readReportsData();
    const dataSources = await readDataSources();
    
    // Generate report ID
    const reportId = `RPT${Date.now()}`;
    
    // Generate report data based on type
    let generatedData = {};
    let fileName = '';
    
    switch (reportData.type) {
        case 'financial':
            generatedData = await generateFinancialReportData(dataSources, reportData.parameters);
            fileName = `financial-report-${reportData.parameters.month || 'current'}.${reportData.format}`;
            break;
            
        case 'student':
            generatedData = await generateStudentReportData(dataSources, reportData.parameters);
            fileName = `student-report-${Date.now()}.${reportData.format}`;
            break;
            
        case 'invoice':
            generatedData = await generateInvoiceReportData(dataSources, reportData.parameters);
            fileName = `invoice-report-${reportData.parameters.month || 'current'}.${reportData.format}`;
            break;
            
        case 'payment':
            generatedData = await generatePaymentReportData(dataSources, reportData.parameters);
            fileName = `payment-report-${reportData.parameters.month || 'current'}.${reportData.format}`;
            break;
            
        case 'ledger':
            generatedData = await generateLedgerReportData(dataSources, reportData.parameters);
            fileName = `ledger-report-${Date.now()}.${reportData.format}`;
            break;
            
        default:
            throw new Error('Unsupported report type');
    }
    
    const newReport = {
        id: reportId,
        name: reportData.name,
        type: reportData.type,
        description: reportData.description,
        generatedBy: reportData.generatedBy || 'admin',
        generatedAt: new Date().toISOString(),
        parameters: reportData.parameters,
        data: generatedData,
        format: reportData.format || 'pdf',
        filePath: `/reports/${reportData.type}/${fileName}`,
        fileSize: `${Math.round(Math.random() * 3 + 1)}.${Math.round(Math.random() * 9)} MB`, // Simulated
        status: 'completed',
        isScheduled: reportData.isScheduled || false,
        scheduleConfig: reportData.scheduleConfig || null
    };
    
    reports.push(newReport);
    await writeReportsData(reports);
    
    return newReport;
}

/**
 * Generate financial report data
 */
async function generateFinancialReportData(dataSources, parameters) {
    const { invoices, payments, ledger } = dataSources;
    
    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaymentAmount = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const outstandingAmount = ledger
        .filter(entry => entry.balanceType === 'Dr')
        .reduce((sum, entry) => sum + (entry.balance || 0), 0);
    
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
    const collectionRate = invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0;
    
    return {
        totalRevenue: totalInvoiceAmount,
        totalCollected: totalPaymentAmount,
        outstandingAmount: outstandingAmount,
        netIncome: totalPaymentAmount,
        collectionRate: Math.round(collectionRate * 100) / 100,
        invoiceCount: invoices.length,
        paymentCount: payments.length,
        period: parameters.month || 'Current'
    };
}

/**
 * Generate student report data
 */
async function generateStudentReportData(dataSources, parameters) {
    const { students } = dataSources;
    
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const inactiveStudents = students.filter(s => s.status === 'Inactive').length;
    const averageFee = students.length > 0 
        ? students.reduce((sum, s) => sum + (s.baseMonthlyFee || 0), 0) / students.length 
        : 0;
    
    // Room distribution
    const roomDistribution = {};
    students.forEach(student => {
        const roomType = student.roomNumber ? student.roomNumber.charAt(0) : 'Unknown';
        roomDistribution[roomType] = (roomDistribution[roomType] || 0) + 1;
    });
    
    return {
        totalStudents: students.length,
        activeStudents: activeStudents,
        inactiveStudents: inactiveStudents,
        averageMonthlyFee: Math.round(averageFee),
        roomDistribution: roomDistribution,
        occupancyRate: students.length > 0 ? (activeStudents / students.length) * 100 : 0
    };
}

/**
 * Generate invoice report data
 */
async function generateInvoiceReportData(dataSources, parameters) {
    const { invoices } = dataSources;
    
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
    const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid').length;
    const partiallyPaidInvoices = invoices.filter(inv => inv.status === 'Partially Paid').length;
    
    const statusBreakdown = {
        paid: paidInvoices,
        unpaid: unpaidInvoices,
        partiallyPaid: partiallyPaidInvoices
    };
    
    return {
        totalInvoices: invoices.length,
        totalAmount: totalAmount,
        averageAmount: invoices.length > 0 ? totalAmount / invoices.length : 0,
        statusBreakdown: statusBreakdown,
        collectionRate: invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0,
        period: parameters.month || 'All time'
    };
}

/**
 * Generate payment report data
 */
async function generatePaymentReportData(dataSources, parameters) {
    const { payments } = dataSources;
    
    const totalAmount = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const averageAmount = payments.length > 0 ? totalAmount / payments.length : 0;
    
    // Payment method breakdown
    const methodBreakdown = {};
    payments.forEach(payment => {
        const method = payment.paymentMethod || 'Unknown';
        methodBreakdown[method] = (methodBreakdown[method] || 0) + 1;
    });
    
    return {
        totalPayments: payments.length,
        totalAmount: totalAmount,
        averageAmount: Math.round(averageAmount),
        methodBreakdown: methodBreakdown,
        period: parameters.month || 'All time'
    };
}

/**
 * Generate ledger report data
 */
async function generateLedgerReportData(dataSources, parameters) {
    const { ledger, students } = dataSources;
    
    const totalDebits = ledger.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = ledger.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const netBalance = totalDebits - totalCredits;
    
    // Student balance summary
    const studentBalances = {};
    ledger.forEach(entry => {
        if (!studentBalances[entry.studentId]) {
            studentBalances[entry.studentId] = 0;
        }
        studentBalances[entry.studentId] += (entry.debit || 0) - (entry.credit || 0);
    });
    
    const studentsWithBalance = Object.values(studentBalances).filter(balance => balance !== 0).length;
    const outstandingAmount = Object.values(studentBalances).filter(balance => balance > 0).reduce((sum, balance) => sum + balance, 0);
    
    return {
        totalEntries: ledger.length,
        totalDebits: totalDebits,
        totalCredits: totalCredits,
        netBalance: netBalance,
        studentsWithBalance: studentsWithBalance,
        outstandingAmount: outstandingAmount,
        totalStudents: students.length
    };
}

/**
 * Get report statistics
 * @returns {Promise<Object>} Report statistics
 */
async function getReportStats() {
    const reports = await readReportsData();
    
    const stats = {
        totalReports: reports.length,
        completedReports: reports.filter(r => r.status === 'completed').length,
        scheduledReports: reports.filter(r => r.isScheduled).length,
        recentReports: 0,
        reportsByType: {},
        reportsByFormat: {},
        totalFileSize: 0
    };
    
    // Calculate recent reports (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    stats.recentReports = reports.filter(r => new Date(r.generatedAt) > weekAgo).length;
    
    // Count by type and format
    reports.forEach(report => {
        // By type
        stats.reportsByType[report.type] = (stats.reportsByType[report.type] || 0) + 1;
        
        // By format
        stats.reportsByFormat[report.format] = (stats.reportsByFormat[report.format] || 0) + 1;
        
        // Total file size (simulated)
        const sizeMatch = report.fileSize.match(/(\d+\.?\d*)/);
        if (sizeMatch) {
            stats.totalFileSize += parseFloat(sizeMatch[1]);
        }
    });
    
    return stats;
}

/**
 * Get available report types
 * @returns {Promise<Array>} Available report types
 */
async function getReportTypes() {
    return [
        {
            value: 'financial',
            label: 'Financial Reports',
            description: 'Revenue, expenses, and payment analysis',
            icon: '💰'
        },
        {
            value: 'student',
            label: 'Student Reports',
            description: 'Student demographics and statistics',
            icon: '👥'
        },
        {
            value: 'invoice',
            label: 'Invoice Reports',
            description: 'Invoice generation and status analysis',
            icon: '🧾'
        },
        {
            value: 'payment',
            label: 'Payment Reports',
            description: 'Payment collection and method analysis',
            icon: '💳'
        },
        {
            value: 'ledger',
            label: 'Ledger Reports',
            description: 'Complete ledger and balance analysis',
            icon: '📊'
        },
        {
            value: 'occupancy',
            label: 'Occupancy Reports',
            description: 'Room utilization and occupancy analysis',
            icon: '🏠'
        }
    ];
}

/**
 * Schedule recurring report
 * @param {Object} scheduleData - Schedule configuration
 * @returns {Promise<Object>} Scheduled report
 */
async function scheduleReport(scheduleData) {
    const reports = await readReportsData();
    
    const scheduledReport = {
        id: `RPT${Date.now()}`,
        name: scheduleData.name,
        type: scheduleData.type,
        description: scheduleData.description,
        generatedBy: scheduleData.generatedBy || 'admin',
        generatedAt: new Date().toISOString(),
        parameters: scheduleData.parameters,
        data: null, // Will be populated when report is actually generated
        format: scheduleData.format || 'pdf',
        filePath: null, // Will be set when report is generated
        fileSize: null,
        status: 'scheduled',
        isScheduled: true,
        scheduleConfig: scheduleData.scheduleConfig
    };
    
    reports.push(scheduledReport);
    await writeReportsData(reports);
    
    return scheduledReport;
}

/**
 * Delete report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Deleted report
 */
async function deleteReport(reportId) {
    const reports = await readReportsData();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
        const error = new Error('Report not found');
        error.statusCode = 404;
        throw error;
    }
    
    const deletedReport = reports.splice(reportIndex, 1)[0];
    await writeReportsData(reports);
    
    return deletedReport;
}

/**
 * Get download information for a report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Download information
 */
async function getReportDownloadInfo(reportId) {
    const report = await getReportById(reportId);
    
    if (!report) {
        const error = new Error('Report not found');
        error.statusCode = 404;
        throw error;
    }
    
    if (report.status !== 'completed') {
        const error = new Error('Report is not ready for download');
        error.statusCode = 422;
        throw error;
    }
    
    return {
        reportId: report.id,
        fileName: report.filePath.split('/').pop(),
        filePath: report.filePath,
        format: report.format,
        fileSize: report.fileSize,
        generatedAt: report.generatedAt,
        downloadUrl: `/api/v1/reports/download/${reportId}` // This would be the actual download endpoint
    };
}

module.exports = {
    getAllReports,
    getReportById,
    generateReport,
    getReportStats,
    getReportTypes,
    scheduleReport,
    deleteReport,
    getReportDownloadInfo
};