import React, { useState, useEffect } from 'react'
import { studentService } from '../services/studentService.js'
import { roomService } from '../services/roomService.js'

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsData, roomsData] = await Promise.all([
          studentService.getStudents(),
          roomService.getRooms()
        ])
        setStudents(studentsData)
        setRooms(roomsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const totalStudents = students.length
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(room => room.occupancy > 0).length

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Students</h2>
          <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Rooms</h2>
          <p className="text-3xl font-bold text-green-600">{totalRooms}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Occupied Rooms</h2>
          <p className="text-3xl font-bold text-red-600">{occupiedRooms}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard