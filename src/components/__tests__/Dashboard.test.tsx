import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '../Dashboard.tsx'

// Mock the services to avoid localStorage dependencies
vi.mock('../../services/studentService.js', () => ({
  studentService: {
    getStudents: vi.fn(() => Promise.resolve([
      { id: 'STU001', name: 'John Doe', status: 'Active' },
      { id: 'STU002', name: 'Jane Smith', status: 'Active' }
    ]))
  }
}))

vi.mock('../../services/roomService.js', () => ({
  roomService: {
    getRooms: vi.fn(() => Promise.resolve([
      { roomNumber: '101', status: 'Occupied', occupancy: 2, bedCount: 4 },
      { roomNumber: '102', status: 'Available', occupancy: 0, bedCount: 2 }
    ]))
  }
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard title', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('should display student statistics', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument()
    })
    
    const studentSection = screen.getByText('Total Students').closest('div')
    expect(studentSection).toHaveTextContent('2')
  })

  it('should display room statistics', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Rooms')).toBeInTheDocument()
    })
    
    const roomSection = screen.getByText('Total Rooms').closest('div')
    expect(roomSection).toHaveTextContent('2')
  })

  it('should display occupied rooms count', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Occupied Rooms')).toBeInTheDocument()
    })
    
    const occupiedSection = screen.getByText('Occupied Rooms').closest('div')
    expect(occupiedSection).toHaveTextContent('1') // 1 occupied room from mock
  })
})