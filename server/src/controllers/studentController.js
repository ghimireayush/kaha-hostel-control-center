const studentService = require('../services/studentService');

/**
 * Get all students with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllStudents(req, res, next) {
    try {
        const { status = 'all', search = '', page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        
        // Validate pagination parameters
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

        const result = await studentService.getAllStudents({
            status,
            search,
            page: pageNum,
            limit: limitNum
        });

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get student statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getStudentStats(req, res, next) {
    try {
        const stats = await studentService.getStudentStats();
        res.status(200).json({
            status: 200,
            data: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get a student by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getStudentById(req, res, next) {
    try {
        const { id } = req.params;
        const student = await studentService.getStudentById(id);

        if (!student) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            data: student
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createStudent(req, res, next) {
    try {
        const studentData = req.body;

        // Basic validation for required fields
        const requiredFields = ['name', 'phone', 'email', 'roomNumber'];
        const missingFields = requiredFields.filter(field => !studentData[field]);
        
        if (missingFields.length > 0) {
            const error = new Error('Missing required fields');
            error.statusCode = 422;
            error.details = missingFields.reduce((acc, field) => {
                acc[field] = `${field} is required`;
                return acc;
            }, {});
            throw error;
        }

        const result = await studentService.createStudent(studentData);

        res.status(201).json({
            status: 201,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update an existing student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateStudent(req, res, next) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await studentService.updateStudent(id, updates);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Advanced search for students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function searchStudents(req, res, next) {
    try {
        const { q: query, filters = {} } = req.body;
        
        if (!query || query.trim().length === 0) {
            const error = new Error('Search query is required');
            error.statusCode = 422;
            error.details = { query: 'Search query cannot be empty' };
            throw error;
        }

        const result = await studentService.searchStudents(query, filters);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Bulk update students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function bulkUpdateStudents(req, res, next) {
    try {
        const { studentIds, updates } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            const error = new Error('Student IDs array is required');
            error.statusCode = 422;
            error.details = { studentIds: 'Must provide an array of student IDs' };
            throw error;
        }

        if (!updates || typeof updates !== 'object') {
            const error = new Error('Updates object is required');
            error.statusCode = 422;
            error.details = { updates: 'Must provide an updates object' };
            throw error;
        }

        const result = await studentService.bulkUpdateStudents(studentIds, updates);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Process student checkout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function processCheckout(req, res, next) {
    try {
        const { id } = req.params;
        const checkoutDetails = req.body;

        // Basic validation for required fields
        if (!checkoutDetails.checkoutDate) {
            const error = new Error('Checkout date is required');
            error.statusCode = 422;
            error.details = { checkoutDate: 'Checkout date is required' };
            throw error;
        }

        const result = await studentService.processCheckout(id, checkoutDetails);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllStudents,
    getStudentStats,
    getStudentById,
    createStudent,
    updateStudent,
    searchStudents,
    bulkUpdateStudents,
    processCheckout
};