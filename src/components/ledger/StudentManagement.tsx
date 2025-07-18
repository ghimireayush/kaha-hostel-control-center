
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import { StudentCheckout } from "@/components/admin/StudentCheckout";
import { checkoutService } from "@/services/checkoutService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, User, Phone, MapPin, LogOut, Calendar, Mail, CreditCard, Home } from "lucide-react";

export const StudentManagement = () => {
  const { state, refreshAllData } = useAppContext();
  const { goToStudentLedger, goToStudentProfile } = useNavigation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [checkoutStudentId, setCheckoutStudentId] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

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

  const handleCheckoutComplete = async (studentId: string, checkoutData: any) => {
    try {
      // Process checkout through service
      const result = await checkoutService.processCheckout(checkoutData);
      
      // Show success message
      toast({
        title: "Checkout Successful",
        description: `Student has been checked out successfully. Room ${result.roomNumber} is now available.`,
      });

      // Refresh all data to reflect changes
      await refreshAllData();
      
      // Close checkout modal
      setCheckoutStudentId("");
      
    } catch (error) {
      console.error('Checkout processing failed:', error);
      toast({
        title: "Checkout Failed",
        description: "Something went wrong during checkout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const checkoutStudent = checkoutStudentId ? state.students.find(s => s.id === checkoutStudentId) : null;

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
                      <div className="flex gap-2 flex-wrap">
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
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setShowDetailsDialog(true);
                          }}
                        >
                          👁️ Details
                        </Button>
                        {student.status === 'Active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setCheckoutStudentId(student.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Checkout
                          </Button>
                        )}
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

      {/* Student Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudentId && (() => {
            const student = state.students.find(s => s.id === selectedStudentId);
            if (!student) return <div>Student not found</div>;
            
            return (
              <div className="space-y-6">
                {/* Student Header */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{student.name}</h3>
                    <p className="text-gray-600">ID: {student.id}</p>
                    <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </div>
                </div>

                {/* Student Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Address:</span>
                        <span>{student.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span>{new Date(student.enrollmentDate).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Guardian Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Guardian Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <p className="font-medium">{student.guardianName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span>{student.guardianPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Emergency:</span>
                        <span>{student.emergencyContact}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Room & Academic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Room & Academic Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Room Number:</span>
                        <p className="font-medium text-lg">{student.roomNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Course:</span>
                        <p>{student.course}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Institution:</span>
                        <p>{student.institution}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Financial Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Base Monthly Fee:</span>
                        <span className="font-medium">₨{student.baseMonthlyFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Laundry Fee:</span>
                        <span>₨{student.laundryFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Food Fee:</span>
                        <span>₨{student.foodFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Monthly:</span>
                        <span className="font-bold">₨{(student.baseMonthlyFee + student.laundryFee + student.foodFee).toLocaleString()}</span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {student.currentBalance > 0 ? (
                          <div className="flex justify-between text-red-600">
                            <span className="font-medium">Outstanding Due:</span>
                            <span className="font-bold">₨{student.currentBalance.toLocaleString()}</span>
                          </div>
                        ) : student.advanceBalance > 0 ? (
                          <div className="flex justify-between text-green-600">
                            <span className="font-medium">Advance Balance:</span>
                            <span className="font-bold">₨{student.advanceBalance.toLocaleString()}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Payment Status:</span>
                            <span className="text-green-600 font-medium">Up to date</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      goToStudentLedger(student.id);
                      setShowDetailsDialog(false);
                    }}
                    className="flex-1"
                  >
                    📚 View Ledger
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetailsDialog(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {student.status === 'Active' && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowDetailsDialog(false);
                        setCheckoutStudentId(student.id);
                      }}
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Checkout Student
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      {checkoutStudent && (
        <StudentCheckout
          student={checkoutStudent}
          onCheckoutComplete={handleCheckoutComplete}
          onClose={() => setCheckoutStudentId("")}
        />
      )}
    </div>
  );
};
