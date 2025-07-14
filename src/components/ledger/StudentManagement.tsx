
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import { Search, User, Phone, MapPin } from "lucide-react";

export const StudentManagement = () => {
  const { state } = useAppContext();
  const { goToStudentLedger, goToStudentProfile } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Parse URL parameters to auto-select student
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentParam = params.get('student');
    if (studentParam) {
      setSelectedStudentId(studentParam);
    }
  }, []);

  const filteredStudents = state.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">👥 Student Management</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600">
            {state.students.length} Total Students
          </Badge>
          <Badge variant="outline" className="text-green-600">
            {state.students.filter(s => s.status === 'Active').length} Active
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by name, room number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List ({filteredStudents.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Monthly Fees</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id}
                    className={selectedStudentId === student.id ? "bg-blue-50 border-blue-200" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{student.roomNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.guardianName}</div>
                        <div className="text-sm text-gray-500">{student.guardianPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>Base: ₨{student.baseMonthlyFee.toLocaleString()}</div>
                        {student.laundryFee > 0 && (
                          <div className="text-sm text-gray-500">Laundry: ₨{student.laundryFee}</div>
                        )}
                        {student.foodFee > 0 && (
                          <div className="text-sm text-gray-500">Food: ₨{student.foodFee}</div>
                        )}
                        <div className="font-medium text-blue-600">
                          Total: ₨{(student.baseMonthlyFee + student.laundryFee + student.foodFee).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.currentBalance > 0 ? (
                          <div className="text-red-600 font-medium">
                            Due: ₨{student.currentBalance.toLocaleString()}
                          </div>
                        ) : student.advanceBalance > 0 ? (
                          <div className="text-green-600 font-medium">
                            Advance: ₨{student.advanceBalance.toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            Up to date
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => goToStudentLedger(student.id)}
                        >
                          📚 Ledger
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedStudentId(student.id)}
                        >
                          👁️ Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No students found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'No students have been enrolled yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {state.students.length}
            </div>
            <div className="text-sm text-gray-500">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {state.students.filter(s => s.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-500">Active Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              ₨{state.students.reduce((sum, s) => sum + (s.currentBalance || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Outstanding</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ₨{state.students.reduce((sum, s) => sum + (s.advanceBalance || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Advances</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
