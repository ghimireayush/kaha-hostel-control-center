import { describe, it, expect } from 'vitest'
import { roomService } from '../roomService.js'

describe('roomService', () => {
  describe('createRoom', () => {
    it('should create a new room with correct properties', async () => {
      const roomData = {
        roomNumber: '101',
        floor: 1,
        bedCount: 4,
        roomType: 'Shared',
        monthlyRent: 5000
      }

      const room = await roomService.createRoom(roomData)

      expect(room).toMatchObject(roomData)
      expect(room.occupancy).toBe(0)
      expect(room.availableBeds).toBe(4)
      expect(room.status).toBe('Active')
      expect(room.occupants).toEqual([])
      expect(room.id).toMatch(/^room-\d+$/)
    })
  })

  describe('getRooms', () => {
    it('should return array of rooms', async () => {
      const rooms = await roomService.getRooms()
      expect(Array.isArray(rooms)).toBe(true)
    })
  })

  describe('getRoomById', () => {
    it('should return room when ID exists', async () => {
      const newRoom = await roomService.createRoom({ 
        roomNumber: '201', 
        bedCount: 2,
        floor: 2
      })
      
      const foundRoom = await roomService.getRoomById(newRoom.id)

      expect(foundRoom).toBeTruthy()
      expect(foundRoom.roomNumber).toBe('201')
    })

    it('should return undefined when ID does not exist', async () => {
      const room = await roomService.getRoomById('nonexistent-id')
      expect(room).toBeUndefined()
    })
  })
})