const roomService = require('../services/roomService');

/**
 * Get all rooms with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllRooms(req, res, next) {
    try {
        // Extract query parameters with defaults
        const { status = 'all', type = 'all', search = '', page = 1, limit = 20 } = req.query;
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

        const result = await roomService.getAllRooms({
            status,
            type,
            search,
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
 * Get a single room by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getRoomById(req, res, next) {
    try {
        const { id } = req.params;
        const room = await roomService.getRoomById(id);

        if (!room) {
            const error = new Error('Room not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            room
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get room statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getRoomStats(req, res, next) {
    try {
        const stats = await roomService.getRoomStats();
        res.status(200).json({
            status: 200,
            stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new room (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createRoom(req, res, next) {
    try {
        const newRoomData = req.body;
        const newRoom = await roomService.createRoom(newRoomData);

        res.status(201).json({
            status: 201,
            newRoom
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update an existing room (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateRoom(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedRoom = await roomService.updateRoom(id, updateData);

        res.status(200).json({
            status: 200,
            updatedRoom
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Assign a student to a room (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function assignStudent(req, res, next) {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        if (!studentId) {
            const error = new Error('Student ID is required');
            error.statusCode = 422;
            error.details = { studentId: 'Student ID is required for assignment' };
            throw error;
        }

        const result = await roomService.assignStudentToRoom(id, studentId);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Remove a student from a room (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function vacateStudent(req, res, next) {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        if (!studentId) {
            const error = new Error('Student ID is required');
            error.statusCode = 422;
            error.details = { studentId: 'Student ID is required for vacating' };
            throw error;
        }

        const result = await roomService.vacateStudentFromRoom(id, studentId);

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Schedule maintenance for a room (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function scheduleMaintenance(req, res, next) {
    try {
        const { id } = req.params;
        const { scheduleDate, notes } = req.body;

        const result = await roomService.scheduleRoomMaintenance(id, {
            scheduleDate,
            notes
        });

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllRooms,
    getRoomById,
    getRoomStats,
    createRoom,
    updateRoom,
    assignStudent,
    vacateStudent,
    scheduleMaintenance
};
