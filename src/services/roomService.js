
import roomsData from '../data/rooms.json';

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
