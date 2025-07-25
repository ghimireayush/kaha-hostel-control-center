const fs = require('fs').promises;
const path = require('path');

// Path to the rooms data file
const roomsDataPath = path.join(__dirname, '../data/rooms.json');

// Helper function to read room data from file
async function readRoomData() {
    try {
        const data = await fs.readFile(roomsDataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading room data:', error);
        throw new Error('Failed to read room data');
    }
}

// Helper function to write room data to file
async function writeRoomData(rooms) {
    try {
        await fs.writeFile(roomsDataPath, JSON.stringify(rooms, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing room data:', error);
        throw new Error('Failed to write room data');
    }
}

/**
 * Get all rooms with optional filtering and pagination
 * @param {Object} options - Filter and pagination options
 * @param {string} options.status - Filter by status ('all', 'Active', 'Maintenance', 'Inactive')
 * @param {string} options.type - Filter by type ('all', 'Dormitory', 'Suite', 'Private')
 * @param {string} options.search - Search term for room number, name, or occupant name
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of items per page
 * @returns {Promise<Object>} Paginated rooms and pagination info
 */
async function getAllRooms({ status = 'all', type = 'all', search = '', page = 1, limit = 20 }) {
    const rooms = await readRoomData();
    let filteredRooms = [...rooms];

    // Apply filters
    if (status !== 'all') {
        // Normalize status filter (e.g., 'active' -> 'Active')
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        filteredRooms = filteredRooms.filter(r => r.status === normalizedStatus);
    }
    if (type !== 'all') {
        // Normalize type filter (e.g., 'dormitory' -> 'Dormitory')
        const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        filteredRooms = filteredRooms.filter(r => r.type === normalizedType);
    }
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredRooms = filteredRooms.filter(r =>
            (r.roomNumber && r.roomNumber.toLowerCase().includes(searchTerm)) ||
            (r.name && r.name.toLowerCase().includes(searchTerm)) ||
            (r.occupants && r.occupants.some(o => o.name.toLowerCase().includes(searchTerm)))
        );
    }

    // Apply pagination
    const totalItems = filteredRooms.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedRooms = filteredRooms.slice(startIndex, startIndex + limit);

    return {
        items: paginatedRooms,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit, 10)
        }
    };
}

/**
 * Get a single room by ID
 * @param {string} id - Room ID
 * @returns {Promise<Object|null>} Room object or null if not found
 */
async function getRoomById(id) {
    const rooms = await readRoomData();
    const room = rooms.find(r => r.id === id);
    return room || null;
}

/**
 * Get room statistics
 * @returns {Promise<Object>} Room statistics including occupancy, revenue, etc.
 */
async function getRoomStats() {
    const rooms = await readRoomData();
    const totalRooms = rooms.length;
    const activeRooms = rooms.filter(r => r.status === 'Active').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
    const inactiveRooms = rooms.filter(r => r.status === 'Inactive').length;

    // Calculate bed counts
    const totalBeds = rooms.reduce((sum, room) => sum + (room.bedCount || 0), 0);
    const occupiedBeds = rooms.reduce((sum, room) => sum + (room.occupancy || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 1000) / 10 : 0; // Round to 1 decimal

    // Mock revenue calculation (assuming all active rooms generate monthly rate * occupancy)
    const totalRevenue = rooms
        .filter(r => r.status === 'Active')
        .reduce((sum, room) => sum + ((room.monthlyRate || 0) * (room.occupancy || 0)), 0);

    const activeRoomCount = activeRooms;
    const averageRate = activeRoomCount > 0 ? Math.round(totalRevenue / activeRoomCount) : 0;

    // Group by type
    const byType = {};
    const types = [...new Set(rooms.map(r => r.type))];
    types.forEach(t => {
        const typeRooms = rooms.filter(r => r.type === t);
        const typeBeds = typeRooms.reduce((sum, r) => sum + (r.bedCount || 0), 0);
        const typeOccupied = typeRooms.reduce((sum, r) => sum + (r.occupancy || 0), 0);
        const typeRevenue = typeRooms
            .filter(r => r.status === 'Active')
            .reduce((sum, r) => sum + ((r.monthlyRate || 0) * (r.occupancy || 0)), 0);

        byType[t.toLowerCase()] = {
            count: typeRooms.length,
            beds: typeBeds,
            occupancy: typeBeds > 0 ? Math.round((typeOccupied / typeBeds) * 1000) / 10 : 0,
            revenue: typeRevenue
        };
    });

    return {
        totalRooms,
        activeRooms,
        maintenanceRooms,
        inactiveRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        totalRevenue,
        averageRate,
        byType
    };
}

/**
 * Create a new room (placeholder implementation)
 * @param {Object} roomData - Room data to create
 * @returns {Promise<Object>} Created room object
 */
async function createRoom(roomData) {
    const rooms = await readRoomData();
    
    // In a real implementation:
    // 1. Validate roomData
    // 2. Generate a new ID
    // 3. Add default values for missing fields
    // 4. Add to rooms array
    // 5. Write back to file
    // 6. Return the created room
    
    const mockNewRoom = {
        id: `room-${rooms.length + 1}`,
        ...roomData,
        status: roomData.status || "Active", // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // rooms.push(mockNewRoom);
    // await writeRoomData(rooms);
    
    return mockNewRoom;
}

/**
 * Update an existing room (placeholder implementation)
 * @param {string} id - Room ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated room object
 */
async function updateRoom(id, updateData) {
    const rooms = await readRoomData();
    const roomIndex = rooms.findIndex(r => r.id === id);
    
    if (roomIndex === -1) {
        const error = new Error('Room not found');
        error.statusCode = 404;
        throw error;
    }

    // In a real implementation:
    // 1. Validate updateData
    // 2. Update the room object
    // 3. Update the updatedAt timestamp
    // 4. Write back to file
    // 5. Return the updated room

    const updatedRoom = {
        ...rooms[roomIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    
    // rooms[roomIndex] = updatedRoom;
    // await writeRoomData(rooms);
    
    return updatedRoom;
}

/**
 * Assign a student to a room (placeholder implementation)
 * @param {string} roomId - Room ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Assignment result
 */
async function assignStudentToRoom(roomId, studentId) {
    // In a real implementation:
    // 1. Find the room by roomId
    // 2. Find the student by studentId
    // 3. Check if the room is available and can accommodate the student
    // 4. Update the room's occupants list and occupancy/availableBeds
    // 5. Update the student's room assignment
    // 6. Return success/failure

    return {
        message: `Student ${studentId} assigned to room ${roomId} successfully`,
        roomId: roomId,
        studentId: studentId
    };
}

/**
 * Remove a student from a room (placeholder implementation)
 * @param {string} roomId - Room ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Vacate result
 */
async function vacateStudentFromRoom(roomId, studentId) {
    // In a real implementation:
    // 1. Find the room by roomId
    // 2. Find the student by studentId
    // 3. Check if the student is in this room
    // 4. Remove the student from the room's occupants list and update occupancy/availableBeds
    // 5. Clear the student's room assignment
    // 6. Return success/failure

    return {
        message: `Student ${studentId} vacated from room ${roomId} successfully`,
        roomId: roomId,
        studentId: studentId
    };
}

/**
 * Schedule maintenance for a room (placeholder implementation)
 * @param {string} roomId - Room ID
 * @param {Object} maintenanceData - Maintenance details
 * @returns {Promise<Object>} Maintenance schedule result
 */
async function scheduleRoomMaintenance(roomId, maintenanceData) {
    // In a real implementation:
    // 1. Find the room by roomId
    // 2. Validate scheduleDate
    // 3. Update the room's status to 'Maintenance'
    // 4. Store maintenance details (scheduleDate, notes, who scheduled it, timestamps)
    // 5. Return success/failure

    return {
        message: `Maintenance scheduled for room ${roomId}`,
        roomId: roomId,
        scheduleDate: maintenanceData.scheduleDate || new Date().toISOString().split('T')[0],
        notes: maintenanceData.notes || "Maintenance scheduled via API"
    };
}

module.exports = {
    getAllRooms,
    getRoomById,
    getRoomStats,
    createRoom,
    updateRoom,
    assignStudentToRoom,
    vacateStudentFromRoom,
    scheduleRoomMaintenance
};
