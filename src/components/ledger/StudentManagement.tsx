
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Student {
  id: string;
  name: string;
  phone: string;
  room: string;
  guardianName: string;
  guardianPhone: string;
  baseFee: number;
  laundryFee: number;
  foodFee: number;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

export const StudentManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock student data
  const [students] = useState<Student[]>([
    {
      id: "1",
      name: "Ram Sharma",
      phone: "9841234567",
      room: "A-101",
      guardianName: "Shyam Sharma",
      guardianPhone: "9841234568",
      baseFee: 12000,
      laundryFee: 1500,
      foodFee: 8000,
      enrollmentDate: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      name: "Sita Poudel",
      phone: "9851234567",
      room: "B-205",
      guardianName: "Rita Poudel",
      guardianPhone: "9851234568",
      baseFee: 15000,
      laundryFee: 2000,
      foodFee: 0,
      enrollmentDate: "2024-02-01",
      status: "active"
    }
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">👥 Student Management</h2>
        <Button onClick={() => setShowAddForm(true)}>
          ➕ Add New Student
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Search Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List ({filteredStudents.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.room}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.guardianName}</div>
                      <div className="text-sm text-gray-500">{student.guardianPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>Base: ₨{student.baseFee.toLocaleString()}</div>
                      {student.laundryFee > 0 && (
                        <div className="text-sm text-gray-500">Laundry: ₨{student.laundryFee}</div>
                      )}
                      {student.foodFee > 0 && (
                        <div className="text-sm text-gray-500">Food: ₨{student.foodFee}</div>
                      )}
                      <div className="font-medium text-blue-600">
                        Total: ₨{(student.baseFee + student.laundryFee + student.foodFee).toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">✏️ Edit</Button>
                      <Button size="sm" variant="outline">📋 Ledger</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Student Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle>➕ Add New Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="Enter student name" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="98XXXXXXXX" />
                </div>
                <div>
                  <Label htmlFor="room">Room Number *</Label>
                  <Input id="room" placeholder="A-101" />
                </div>
                <div>
                  <Label htmlFor="enrollment">Enrollment Date *</Label>
                  <Input id="enrollment" type="date" />
                </div>
                <div>
                  <Label htmlFor="guardian">Guardian Name *</Label>
                  <Input id="guardian" placeholder="Guardian full name" />
                </div>
                <div>
                  <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                  <Input id="guardianPhone" placeholder="98XXXXXXXX" />
                </div>
                <div>
                  <Label htmlFor="baseFee">Base Monthly Fee (₨) *</Label>
                  <Input id="baseFee" type="number" placeholder="12000" />
                </div>
                <div>
                  <Label htmlFor="laundryFee">Laundry Fee (₨)</Label>
                  <Input id="laundryFee" type="number" placeholder="1500" />
                </div>
                <div>
                  <Label htmlFor="foodFee">Food Fee (₨)</Label>
                  <Input id="foodFee" type="number" placeholder="8000" />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddForm(false)}>
                  💾 Save Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
