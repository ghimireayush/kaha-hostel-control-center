import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Check, X, UserPlus, Clock, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";

const BookingRequests = () => {
  const { state, approveBooking } = useAppContext();
  const { goToLedger } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  const handleApprove = async (request: any) => {
    setApproving(true);
    try {
      const roomSuggestion = request.preferredRoom === 'Single Room' ? 'A-101' :
                           request.preferredRoom === 'Shared Room' ? 'B-205' : 'C-301';
      
      const success = await approveBooking(request.id, roomSuggestion);
      
      if (success) {
        toast.success(`${request.name} approved! Student profile created and ledger activated.`, {
          duration: 4000,
          action: {
            label: "View Student Profile",
            onClick: () => goToLedger("students")
          }
        });
        setSelectedRequest(null);
      } else {
        toast.error("Failed to approve booking request");
      }
    } catch (error) {
      toast.error("Error approving booking request");
      console.error("Approval error:", error);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (request: any) => {
    try {
      // In a real app, you'd call an API here
      toast.error(`${request.name}'s request has been rejected.`);
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Error rejecting booking request");
      console.error("Rejection error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRequests = state.bookingRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || request.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = state.bookingRequests.filter(req => req.status === 'Pending').length;
  const approvedCount = state.bookingRequests.filter(req => req.status === 'Approved').length;
  const rejectedCount = state.bookingRequests.filter(req => req.status === 'Rejected').length;

  if (state.loading) {
    return (
      <MainLayout activeTab="bookings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading booking requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="bookings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">📝 Booking Requests</h2>
            <p className="text-gray-600 mt-1">Manage student admission requests and approvals</p>
          </div>
          <Button 
            onClick={() => goToLedger("students")}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            📚 View All Students ({state.students.length})
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-3xl font-bold text-green-700">{approvedCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Requests</p>
                  <p className="text-3xl font-bold text-blue-700">{state.bookingRequests.length}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Filter Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Preferred Room</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-blue-600">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {request.phone}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {request.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.guardianName}</p>
                        <p className="text-sm text-gray-500">{request.guardianPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.preferredRoom}</TableCell>
                    <TableCell>{request.checkInDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApprove(request)}
                              disabled={approving}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(request)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>📄 Request Details - {selectedRequest.id}</span>
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Student Information</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Name:</strong> {selectedRequest.name}</p>
                      <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                      <p><strong>Email:</strong> {selectedRequest.email}</p>
                      <p><strong>Address:</strong> {selectedRequest.address}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Guardian Information</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Name:</strong> {selectedRequest.guardianName}</p>
                      <p><strong>Phone:</strong> {selectedRequest.guardianPhone}</p>
                      <p><strong>Emergency:</strong> {selectedRequest.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Booking Details</h4>
                  <div className="mt-2 space-y-2">
                    <p><strong>Preferred Room:</strong> {selectedRequest.preferredRoom}</p>
                    <p><strong>Expected Join Date:</strong> {selectedRequest.checkInDate}</p>
                    <p><strong>Request Date:</strong> {selectedRequest.requestDate}</p>
                    <p><strong>Course:</strong> {selectedRequest.course}</p>
                    <p><strong>Institution:</strong> {selectedRequest.institution}</p>
                    <p><strong>ID Proof Type:</strong> {selectedRequest.idProofType}</p>
                    <p><strong>ID Proof Number:</strong> {selectedRequest.idProofNumber}</p>
                  </div>
                </div>

                {selectedRequest.status === 'Pending' && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(selectedRequest)}
                      disabled={approving}
                    >
                      {approving ? "Processing..." : "✅ Approve & Create Student Profile"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleReject(selectedRequest)}
                    >
                      ❌ Reject Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BookingRequests;
