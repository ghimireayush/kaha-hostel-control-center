
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import { StudentCheckout } from "@/components/admin/StudentCheckout";
import { StudentChargeConfiguration } from "@/components/ledger/StudentChargeConfiguration";
import { checkoutService } from "@/services/checkoutService";
import { studentService } from "@/services/studentService";
import { roomService } from "@/services/roomService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, User, Phone, MapPin, LogOut, Calendar, Mail, CreditCard, Home, Settings, UserPlus } from "lucide-react";

export const StudentManagement = () => {
  const { state, refreshAllData } = useAppContext();
  const { goToStudentLedger, goToStudentProfile } = useNavigation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [checkoutStudentId, setCheckoutStudentId] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [chargeConfigStudentId, setChargeConfigStudentId] = useState("");
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    roomNumber: "",
    course: "",
    institution: "",
    guardianName: "",
    guardianPhone: "",
    emergencyContact: "",
    baseMonthlyFee: 0,
    laundryFee: 0,
    foodFee: 0
  });

  // Parse URL parameters to auto-select student
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentParam = params.get('student');
    if (studentParam) {
      setSelectedStudentId(studentParam);
    }
  }, []);

  // Load available rooms when add student dialog opens
  useEffect(() => {
    if (showAddStudentDialog) {
      loadAvailableRooms();
    }
  }, [showAddStudentDialog]);

  const loadAvailableRooms = async () => {
    try {
      const rooms = await roomService.getAvailableRooms();
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Failed to load available rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load available rooms",
        variant: "destructive"
      });
    }
  };

  const handleNewStudentFormChange = (field: string, value: string | number) => {
    setNewStudentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetNewStudentForm = () => {
    setNewStudentForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      roomNumber: "",
      course: "",
      institution: "",
      guardianName: "",
      guardianPhone: "",
      emergencyContact: "",
      baseMonthlyFee: 0,
      laundryFee: 0,
      foodFee: 0
    });
  };

  const handleAddStudent = async () => {
    try {
      // Validate required fields
      if (!newStudentForm.name || !newStudentForm.phone || !newStudentForm.roomNumber) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Name, Phone, Room)",
          variant: "destructive"
        });
        return;
      }

      // Create new student
      const newStudent = await studentService.createStudent(newStudentForm);
      
      // Assign room to student
      await roomService.assignRoom(newStudentForm.roomNumber, newStudent.id);

      // Show success message
      toast({
        title: "Student Added Successfully",
        description: `${newStudent.name} has been enrolled and assigned to room ${newStudent.roomNumber}`,
      });

      // Refresh all data
      await refreshAllData();
      
      // Close dialog and reset form
      setShowAddStudentDialog(false);
      resetNewStudentForm();
      
    } catch (error) {
      console.error('Failed to add student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive"
      });
    }
  };

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
        <h2 className="text-3xl font-bold text-[#231F20]">👥 Student Management</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[#1295D0] border-[#1295D0]/30">
              {state.students.length} Total Students
            </Badge>
            <Badge variant="outline" className="text-[#07A64F] border-[#07A64F]/30">
              {state.students.filter(s => s.status === 'Active').length} Active
            </Badge>
          </div>
          <Button 
            onClick={() => setShowAddStudentDialog(true)}
            className="bg-[#07A64F] hover:bg-[#07A64F]/90 text-white border-0"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Student
          </Button>
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setChargeConfigStudentId(student.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure Charges
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
        <Card className="border-[#1295D0]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#1295D0]/10 p-2 rounded-full">
              <User className="h-5 w-5 text-[#1295D0]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1295D0]">
                {state.students.length}
              </div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#07A64F]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#07A64F]/10 p-2 rounded-full">
              <User className="h-5 w-5 text-[#07A64F]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#07A64F]">
                {state.students.filter(s => s.status === 'Active').length}
              </div>
              <div className="text-sm text-gray-500">Active Students</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                ₨{state.students.reduce((sum, s) => sum + (s.currentBalance || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Outstanding</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#07A64F]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#07A64F]/10 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-[#07A64F]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#07A64F]">
                ₨{state.students.reduce((sum, s) => sum + (s.advanceBalance || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Advances</div>
            </div>
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

      {/* Charge Configuration Modal */}
      {chargeConfigStudentId && (
        <StudentChargeConfiguration
          studentId={chargeConfigStudentId}
          isOpen={!!chargeConfigStudentId}
          onClose={() => setChargeConfigStudentId("")}
          onSuccess={() => {
            toast({
              title: "Charges Configured",
              description: "Student charges have been configured and initial invoice generated."
            });
            refreshAllData();
          }}
        />
      )}

      {/* Add New Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Student
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter student's full name"
                      value={newStudentForm.name}
                      onChange={(e) => handleNewStudentFormChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={newStudentForm.phone}
                      onChange={(e) => handleNewStudentFormChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newStudentForm.email}
                      onChange={(e) => handleNewStudentFormChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter home address"
                      value={newStudentForm.address}
                      onChange={(e) => handleNewStudentFormChange('address', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course/Program</Label>
                    <Input
                      id="course"
                      placeholder="Enter course or program"
                      value={newStudentForm.course}
                      onChange={(e) => handleNewStudentFormChange('course', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution/College</Label>
                    <Input
                      id="institution"
                      placeholder="Enter institution name"
                      value={newStudentForm.institution}
                      onChange={(e) => handleNewStudentFormChange('institution', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name</Label>
                    <Input
                      id="guardianName"
                      placeholder="Enter guardian's name"
                      value={newStudentForm.guardianName}
                      onChange={(e) => handleNewStudentFormChange('guardianName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Guardian Phone</Label>
                    <Input
                      id="guardianPhone"
                      placeholder="Enter guardian's phone"
                      value={newStudentForm.guardianPhone}
                      onChange={(e) => handleNewStudentFormChange('guardianPhone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Enter emergency contact number"
                      value={newStudentForm.emergencyContact}
                      onChange={(e) => handleNewStudentFormChange('emergencyContact', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Assignment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Room Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Select Room *</Label>
                  <Select
                    value={newStudentForm.roomNumber}
                    onValueChange={(value) => handleNewStudentFormChange('roomNumber', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an available room" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.roomNumber}>
                          Room {room.roomNumber} - {room.availableBeds} bed(s) available 
                          (NPR {room.monthlyRate?.toLocaleString() || 'N/A'}/month)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableRooms.length === 0 && (
                    <p className="text-sm text-red-600">No rooms available. Please check room configuration.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fee Configuration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Fee Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseMonthlyFee">Base Monthly Fee (NPR)</Label>
                    <Input
                      id="baseMonthlyFee"
                      type="number"
                      placeholder="0"
                      value={newStudentForm.baseMonthlyFee}
                      onChange={(e) => handleNewStudentFormChange('baseMonthlyFee', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laundryFee">Laundry Fee (NPR)</Label>
                    <Input
                      id="laundryFee"
                      type="number"
                      placeholder="0"
                      value={newStudentForm.laundryFee}
                      onChange={(e) => handleNewStudentFormChange('laundryFee', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foodFee">Food Fee (NPR)</Label>
                    <Input
                      id="foodFee"
                      type="number"
                      placeholder="0"
                      value={newStudentForm.foodFee}
                      onChange={(e) => handleNewStudentFormChange('foodFee', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Monthly Fee:</span>
                    <span className="text-xl font-bold text-blue-600">
                      NPR {(newStudentForm.baseMonthlyFee + newStudentForm.laundryFee + newStudentForm.foodFee).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddStudentDialog(false);
                  resetNewStudentForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newStudentForm.name || !newStudentForm.phone || !newStudentForm.roomNumber}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
