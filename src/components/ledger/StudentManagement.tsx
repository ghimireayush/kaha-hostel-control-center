import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, RefreshCw, Users, UserCheck, UserX } from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { Student, CreateStudentDto } from '../../types/api';

interface StudentManagementProps {
  className?: string;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ className = '' }) => {
  const {
    students,
    loading,
    error,
    searchTerm,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    refreshData
  } = useStudents();

  const [selectedTab, setSelectedTab] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter students based on selected tab
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    switch (selectedTab) {
      case 'Active':
        return students.filter(student => student.status === 'Active');
      case 'Inactive':
        return students.filter(student => student.status === 'Inactive');
      default:
        return students;
    }
  }, [students, selectedTab]);

  const handleAddStudent = async (studentData: CreateStudentDto) => {
    setIsSubmitting(true);
    try {
      await createStudent(studentData);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (studentData: Partial<Student>) => {
    if (!selectedStudent) return;

    setIsSubmitting(true);
    try {
      await updateStudent(selectedStudent.id, studentData);
      setShowEditDialog(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Failed to update student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await deleteStudent(studentId);
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setShowEditDialog(true);
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <Users className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Students</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => searchStudents(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'all', label: 'All Students', icon: Users },
            { key: 'Active', label: 'Active', icon: UserCheck },
            { key: 'Inactive', label: 'Inactive', icon: UserX }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {key === 'all' ? students?.length || 0 :
                  key === 'Active' ? students?.filter(s => s.status === 'Active').length || 0 :
                    students?.filter(s => s.status === 'Inactive').length || 0}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No students match your search criteria.' : 'Get started by adding your first student.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddDialog(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.roomNumber || 'Not assigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : student.status === 'Inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.phone}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(student)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Student"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Dialog */}
      {showAddDialog && (
        <StudentDialog
          title="Add New Student"
          onSubmit={handleAddStudent}
          onClose={() => setShowAddDialog(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Edit Student Dialog */}
      {showEditDialog && selectedStudent && (
        <StudentDialog
          title="Edit Student"
          student={selectedStudent}
          onSubmit={handleEditStudent}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedStudent(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* View Student Dialog */}
      {showViewDialog && selectedStudent && (
        <StudentViewDialog
          student={selectedStudent}
          onClose={() => {
            setShowViewDialog(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

// Student Dialog Component
interface StudentDialogProps {
  title: string;
  student?: Student;
  onSubmit: (data: CreateStudentDto) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const StudentDialog: React.FC<StudentDialogProps> = ({
  title,
  student,
  onSubmit,
  onClose,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    roomNumber: student?.roomNumber || '',
    address: student?.address || '',
    enrollmentDate: student?.enrollmentDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Date
              </label>
              <input
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : student ? 'Update' : 'Add'} Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Student View Dialog Component
interface StudentViewDialogProps {
  student: Student;
  onClose: () => void;
}

const StudentViewDialog: React.FC<StudentViewDialogProps> = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Student Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-blue-600">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-lg font-medium text-gray-900">{student.name}</div>
                <div className="text-sm text-gray-500">ID: {student.id}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : student.status === 'Inactive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {student.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Room</label>
                <p className="text-sm text-gray-900">{student.roomNumber || 'Not assigned'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900">{student.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="text-sm text-gray-900">{student.phone}</p>
            </div>

            {student.guardianPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Guardian Contact</label>
                <p className="text-sm text-gray-900">{student.guardianPhone}</p>
              </div>
            )}

            {student.address && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm text-gray-900">{student.address}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;