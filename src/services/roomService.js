
import roomsData from '../data/rooms.json' with { type: 'json' };

let rooms = [...roomsData];

export const roomService = {
  // Get all rooms
  async getRooms() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...rooms]), 100);
    });
  },

  // Get room by ID
  async getRoomById(id) {
    return new Promise((resolve) => {
      const room = rooms.find(r => r.id === id);
      setTimeout(() => resolve(room), 100);
    });
  },

  // Create new room
  async createRoom(roomData) {
    return new Promise((resolve) => {
      const newRoom = {
        id: `room-${rooms.length + 1}`,
        ...roomData,
        occupancy: 0,
        status: 'Active',
        layout: null,
        occupants: [],
        availableBeds: roomData.bedCount,
        lastCleaned: new Date().toISOString().split('T')[0],
        maintenanceStatus: 'Good'
      };
      rooms.push(newRoom);
      setTimeout(() => resolve(newRoom), 100);
    });
  },

  // Update room
  async updateRoom(id, updates) {
    return new Promise((resolve) => {
      const index = rooms.findIndex(r => r.id === id);
      if (index !== -1) {
        rooms[index] = { ...rooms[index], ...updates };
        setTimeout(() => resolve(rooms[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Delete room
  async deleteRoom(id) {
    return new Promise((resolve) => {
      const index = rooms.findIndex(r => r.id === id);
      if (index !== -1) {
        const deletedRoom = rooms.splice(index, 1)[0];
        setTimeout(() => resolve(deletedRoom), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Get available rooms
  async getAvailableRooms() {
    return new Promise((resolve) => {
      const available = rooms.filter(r => r.availableBeds > 0 && r.status === 'Active');
      setTimeout(() => resolve(available), 100);
    });
  },

  // Vacate room (remove student from room)
  async vacateRoom(roomNumber, studentId) {
    return new Promise((resolve) => {
      const room = rooms.find(r => r.roomNumber === roomNumber);
      if (room && room.occupants.includes(studentId)) {
        // Remove student from occupants
        room.occupants = room.occupants.filter(id => id !== studentId);
        // Decrease occupancy
        room.occupancy = Math.max(0, room.occupancy - 1);
        // Increase available beds
        room.availableBeds = room.bedCount - room.occupancy;
        // Update last cleaned date
        room.lastCleaned = new Date().toISOString().split('T')[0];
        
        console.log(`Room ${roomNumber} vacated by student ${studentId}. Available beds: ${room.availableBeds}`);
        setTimeout(() => resolve(room), 100);
      } else {
        console.log(`Student ${studentId} not found in room ${roomNumber}`);
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Assign room to student
  async assignRoom(roomNumber, studentId) {
    return new Promise((resolve) => {
      const room = rooms.find(r => r.roomNumber === roomNumber);
      if (room && room.availableBeds > 0) {
        // Add student to occupants if not already there
        if (!room.occupants.includes(studentId)) {
          room.occupants.push(studentId);
          room.occupancy = room.occupants.length;
          room.availableBeds = room.bedCount - room.occupancy;
        }
        setTimeout(() => resolve(room), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Get room statistics
  async getRoomStats() {
    return new Promise((resolve) => {
      const stats = {
        totalRooms: rooms.length,
        activeRooms: rooms.filter(r => r.status === 'Active').length,
        totalBeds: rooms.reduce((sum, r) => sum + r.bedCount, 0),
        occupiedBeds: rooms.reduce((sum, r) => sum + r.occupancy, 0),
        availableBeds: rooms.reduce((sum, r) => sum + r.availableBeds, 0),
        occupancyRate: Math.round((rooms.reduce((sum, r) => sum + r.occupancy, 0) / rooms.reduce((sum, r) => sum + r.bedCount, 0)) * 100)
      };
      setTimeout(() => resolve(stats), 100);
    });
  }
};
