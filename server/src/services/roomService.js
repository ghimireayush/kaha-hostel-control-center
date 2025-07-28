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
 * Create a new room
 * @param {Object} roomData - Room data to create
 * @returns {Promise<Object>} Created room object
 */
async function createRoom(roomData) {
    const rooms = await readRoomData();
    
    // Validate required fields
    if (!roomData.name || !roomData.type || !roomData.bedCount) {
        const error = new Error('Missing required fields: name, type, and bedCount are required');
        error.statusCode = 422;
        error.details = {
            name: !roomData.name ? 'Name is required' : undefined,
            type: !roomData.type ? 'Type is required' : undefined,
            bedCount: !roomData.bedCount ? 'Bed count is required' : undefined
        };
        throw error;
    }

    // Generate room number if not provided
    const roomNumber = roomData.roomNumber || `${roomData.type.charAt(0)}-${String(rooms.length + 1).padStart(3, '0')}`;
    
    // Check if room number already exists
    if (rooms.some(r => r.roomNumber === roomNumber)) {
        const error = new Error('Room number already exists');
        error.statusCode = 422;
        error.details = { roomNumber: 'Room number must be unique' };
        throw error;
    }

    const newRoom = {
        id: `room-${Date.now()}`,
        name: roomData.name,
        type: roomData.type,
        bedCount: parseInt(roomData.bedCount),
        occupancy: 0,
        gender: roomData.gender || 'Mixed',
        monthlyRate: parseInt(roomData.baseRate || roomData.monthlyRate || 12000),
        dailyRate: Math.round((roomData.baseRate || roomData.monthlyRate || 12000) / 30),
        amenities: roomData.amenities || [],
        status: roomData.status || 'Active',
        layout: null,
        floor: roomData.floor || 'Ground Floor',
        roomNumber: roomNumber,
        occupants: [],
        availableBeds: parseInt(roomData.bedCount),
        lastCleaned: new Date().toISOString().split('T')[0],
        maintenanceStatus: 'Good',
        pricingModel: 'monthly',
        description: roomData.description || `${roomData.type} room with ${roomData.bedCount} beds`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    rooms.push(newRoom);
    await writeRoomData(rooms);
    
    return newRoom;
}

/**
 * Update an existing room
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

    // Validate room number uniqueness if being updated
    if (updateData.roomNumber && updateData.roomNumber !== rooms[roomIndex].roomNumber) {
        if (rooms.some(r => r.roomNumber === updateData.roomNumber && r.id !== id)) {
            const error = new Error('Room number already exists');
            error.statusCode = 422;
            error.details = { roomNumber: 'Room number must be unique' };
            throw error;
        }
    }

    // Update numeric fields properly
    const updatedRoom = {
        ...rooms[roomIndex],
        ...updateData,
        // Ensure numeric fields are properly converted
        bedCount: updateData.bedCount ? parseInt(updateData.bedCount) : rooms[roomIndex].bedCount,
        monthlyRate: updateData.monthlyRate ? parseInt(updateData.monthlyRate) : 
                    updateData.baseRate ? parseInt(updateData.baseRate) : rooms[roomIndex].monthlyRate,
        dailyRate: updateData.monthlyRate ? Math.round(parseInt(updateData.monthlyRate) / 30) :
                  updateData.baseRate ? Math.round(parseInt(updateData.baseRate) / 30) : rooms[roomIndex].dailyRate,
        updatedAt: new Date().toISOString()
    };
    
    rooms[roomIndex] = updatedRoom;
    await writeRoomData(rooms);
    
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
 * Get available rooms (rooms with available beds and active status)
 * @returns {Promise<Array>} Array of available rooms
 */
async function getAvailableRooms() {
    const rooms = await readRoomData();
    
    // Filter rooms that are active and have available beds
    const availableRooms = rooms.filter(room => 
        room.status === 'Active' && 
        room.availableBeds > 0
    );

    return availableRooms;
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
    getAvailableRooms,
    scheduleRoomMaintenance
};
