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
          <div className="text-center space-y-4">
            <div className="relative">
              <svg width="48" height="72" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
                <g clipPath="url(#clip0_319_901)">
                  <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F"/>
                  <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F"/>
                  <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20"/>
                  <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#2563eb"/>
                  <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
                  <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
                </g>
                <defs>
                  <clipPath id="clip0_319_901">
                    <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
                  </clipPath>
                </defs>
              </svg>
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-[#07A64F]"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading booking requests...</p>
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
