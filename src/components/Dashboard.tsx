import React, { useState, useEffect } from 'react'
import { studentService } from '../services/studentService.js'
import { roomService } from '../services/roomService.js'
import { Users, Building, Bed, TrendingUp, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="relative">
              <svg width="48" height="72" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
                <g clipPath="url(#clip0_319_901)">
                  <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F" />
                  <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F" />
                  <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20" />
                  <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#2563eb" />
                  <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white" />
                  <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20" />
                </g>
                <defs>
                  <clipPath id="clip0_319_901">
                    <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)" />
                  </clipPath>
                </defs>
              </svg>
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-[#07A64F]"></div>
            </div>
            <span className="text-lg text-gray-600 font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  const totalStudents = students.length
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(room => room.occupancy > 0).length
  const availableRooms = totalRooms - occupiedRooms
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Rooms',
      value: totalRooms,
      icon: Building,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: 'Stable',
      changeType: 'neutral'
    },
    {
      title: 'Occupied Rooms',
      value: occupiedRooms,
      icon: Bed,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '+5%',
      changeType: 'positive'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your hostel today.</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${stat.changeType === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : stat.changeType === 'negative'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>

                  {/* Progress bar for occupancy */}
                  {stat.title === 'Occupancy Rate' && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              <div className="text-center">
                <Users className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                <h3 className="font-medium text-gray-900 group-hover:text-blue-700">Add New Student</h3>
                <p className="text-sm text-gray-500 mt-1">Register a new student</p>
              </div>
            </button>

            <button className="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200">
              <div className="text-center">
                <Building className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2 transition-colors" />
                <h3 className="font-medium text-gray-900 group-hover:text-green-700">Manage Rooms</h3>
                <p className="text-sm text-gray-500 mt-1">Configure room settings</p>
              </div>
            </button>

            <button className="group p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
                <h3 className="font-medium text-gray-900 group-hover:text-purple-700">Record Payment</h3>
                <p className="text-sm text-gray-500 mt-1">Process student payments</p>
              </div>
            </button>
          </div>
        </div>

        {/* Room Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bed className="h-5 w-5 text-blue-500 mr-2" />
              Room Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-800">Available Rooms</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{availableRooms}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium text-blue-800">Occupied Rooms</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{occupiedRooms}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New student enrolled</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Room maintenance completed</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard