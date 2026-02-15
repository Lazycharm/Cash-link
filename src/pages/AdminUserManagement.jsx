
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Notification } from "@/entities/Notification";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  ArrowLeft,
  UserCheck,
  AlertCircle,
  FileText,
  UserPlus,
  Mail,
  Send,
  Share2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState({});
  
  // Invite user state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users) {
      setFilteredUsers([]);
      return;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    const results = users.filter(user => {
      if (!user) return false;

      const nameMatch = (user.full_name || '').toLowerCase().includes(lowerCaseSearch);
      const emailMatch = (user.email || '').toLowerCase().includes(lowerCaseSearch);
      const roleMatch = (user.app_role || '').toLowerCase().includes(lowerCaseSearch);
      const preferredRoleMatch = (user.preferred_app_role || '').toLowerCase().includes(lowerCaseSearch);

      return nameMatch || emailMatch || roleMatch || preferredRoleMatch;
    });
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      setInviteError("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setInviteError("You must be logged in to invite users");
        setIsInviting(false);
        return;
      }

      const response = await supabase.functions.invoke('invite-user', {
        body: { 
          email: inviteEmail.trim(),
          role: inviteRole 
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to send invitation");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setInviteSuccess(`Invitation sent successfully to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("user");
      
      // Close dialog after a short delay
      setTimeout(() => {
        setInviteDialogOpen(false);
        setInviteSuccess("");
      }, 2000);

    } catch (error) {
      console.error("Error inviting user:", error);
      setInviteError(error.message || "Failed to send invitation. Please try again.");
    }

    setIsInviting(false);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await User.list();
      setUsers(allUsers || []);
      setFilteredUsers(allUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    }
    setIsLoading(false);
  };

  const handleKycUpdate = async (userId, status) => {
    setUpdating(prev => ({ ...prev, [userId]: 'kyc' }));

    try {
      await User.update(userId, { kyc_status: status });

      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, kyc_status: status } : u
      );
      setUsers(updatedUsers);

      try {
        const message = status === 'approved' ?
          'Your KYC verification has been approved! You can now access all features.' :
          'Your KYC verification has been rejected. Please check your documents and resubmit.';

        await Notification.create({
          user_id: userId,
          message: message,
          type: status === 'approved' ? 'success' : 'warning'
        });
        console.log(`KYC ${status} notification sent to user ${userId}`);
      } catch (notifError) {
        console.log("Could not create KYC notification:", notifError);
      }

    } catch (error) {
      console.error("Failed to update KYC status:", error);
      alert("Failed to update KYC status. Please try again.");
    }

    setUpdating(prev => ({ ...prev, [userId]: null }));
  };

  const handleRoleUpdate = async (userId, newRole) => {
    setUpdating(prev => ({ ...prev, [userId]: 'role' }));

    try {
      const updatePayload = {
        role: newRole,
        app_role: newRole,
        requested_role: null,
        role_request_status: 'approved' // Approve the role when admin assigns it
      };

      console.log(`Attempting to update user ${userId} to role ${newRole}`);

      await User.update(userId, updatePayload);

      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, role: newRole, app_role: newRole, requested_role: null, role_request_status: 'approved' } : u
      );
      setUsers(updatedUsers);

      try {
        console.log(`Creating notification for user ${userId}`);
        const roleLabels = { vendor: 'Business Owner', agent: 'Money Agent', driver: 'Driver', customer: 'Customer' };
        const notification = await Notification.create({
          user_id: userId,
          message: `Great news! You've been approved as a ${roleLabels[newRole] || newRole}. You can now submit your KYC documents to unlock all professional features.`,
          type: 'success',
          link: '/profile'
        });
        console.log('Notification created successfully:', notification);
        alert(`✅ SUCCESS: User role updated to ${newRole} and notification sent!`);
      } catch (notifError) {
        console.error("Failed to create notification:", notifError);
        alert(`✅ Role updated to ${newRole} but notification failed to send`);
      }

    } catch (error) {
      console.error("DETAILED ERROR:", error);
      alert(`❌ FAILED to update role to ${newRole}\n\nError: ${error.message}`);
    }

    setUpdating(prev => ({ ...prev, [userId]: null }));
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "not_submitted": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700 border-red-200";
      case "vendor": return "bg-purple-100 text-purple-700 border-purple-200";
      case "agent": return "bg-green-100 text-green-700 border-green-200";
      case "driver": return "bg-blue-100 text-blue-700 border-blue-200";
      case "customer": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleStatusBadgeClass = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("AdminDashboard")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">View, manage, and verify users. Assign roles and manage KYC status.</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 rounded-xl"
                  />
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    const shareData = {
                      title: 'Join CashLink',
                      text: 'Join CashLink - Your African community app for businesses, jobs, events, and more in UAE!',
                      url: window.location.origin
                    };
                    
                    if (navigator.share && navigator.canShare(shareData)) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {
                        if (err.name !== 'AbortError') {
                          console.error('Share failed:', err);
                        }
                      }
                    } else {
                      // Fallback for browsers that don't support Web Share API
                      const text = encodeURIComponent('Join CashLink - Your African community app! ' + window.location.origin);
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share App
                </Button>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
                      <UserPlus className="w-4 h-4" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-green-600" />
                        Invite New User
                      </DialogTitle>
                      <DialogDescription>
                        Send an email invitation to a new user. They will receive a link to set up their account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="user@example.com"
                          value={inviteEmail}
                          onChange={(e) => {
                            setInviteEmail(e.target.value);
                            setInviteError("");
                          }}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Initial Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User (Default)</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="driver">Driver</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          The user can request a different role after signing up.
                        </p>
                      </div>
                      
                      {inviteError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          <XCircle className="w-4 h-4 flex-shrink-0" />
                          {inviteError}
                        </div>
                      )}
                      
                      {inviteSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          {inviteSuccess}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setInviteDialogOpen(false);
                          setInviteEmail("");
                          setInviteError("");
                          setInviteSuccess("");
                        }}
                        disabled={isInviting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleInviteUser}
                        disabled={isInviting || !inviteEmail.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isInviting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Requested Role</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone_number || 'Not provided'}</TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getRoleBadgeClass(user.app_role || user.role || 'customer')}`}>
                            {user.app_role || user.role || 'customer'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.requested_role && user.role_request_status === 'pending' ? (
                            <Badge variant="outline" className="capitalize border-orange-500 text-orange-600 bg-orange-50">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {user.requested_role} (Pending)
                            </Badge>
                          ) : user.role_request_status === 'approved' && user.requested_role ? (
                            <Badge className="capitalize bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getBadgeClass(user.kyc_status || 'not_submitted')}`}>
                            {user.kyc_status || 'not_submitted'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.kyc_documents?.length > 0 ? (
                            <div className="flex flex-col space-y-1">
                              {user.kyc_documents.map((doc, index) => (
                                <a href={doc.url} key={index} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span className="font-semibold capitalize">{(doc.type || '').replace('_', ' ')}:</span>
                                  {doc.name || `Doc ${index + 1}`}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap items-center">
                            {/* Role Request Approval */}
                            {user.requested_role && user.role_request_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updating[user.id] === 'role'}
                                  className="border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => handleRoleUpdate(user.id, user.requested_role)}
                                >
                                  {updating[user.id] === 'role' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <UserCheck className="w-4 h-4 mr-2" />
                                  )}
                                  Approve as {user.requested_role}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updating[user.id] === 'role'}
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                  onClick={async () => {
                                    setUpdating(prev => ({ ...prev, [user.id]: 'role' }));
                                    try {
                                      await User.update(user.id, { role_request_status: 'rejected' });
                                      setUsers(users.map(u => u.id === user.id ? { ...u, role_request_status: 'rejected' } : u));
                                      await Notification.create({
                                        user_id: user.id,
                                        message: `Your request to become a ${user.requested_role} has been rejected. Please contact support for more information.`,
                                        type: 'warning',
                                        link: '/profile'
                                      });
                                    } catch (e) { console.error(e); }
                                    setUpdating(prev => ({ ...prev, [user.id]: null }));
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {/* KYC Approval */}
                            {user.kyc_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updating[user.id] === 'kyc'}
                                  className="border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => handleKycUpdate(user.id, 'approved')}
                                >
                                  {updating[user.id] === 'kyc' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Approve KYC
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updating[user.id] === 'kyc'}
                                  className="border-red-500 text-red-600 hover:bg-red-50"
                                  onClick={() => handleKycUpdate(user.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}

                            {user.role !== 'admin' && (
                              <Select
                                value={user.app_role || 'customer'}
                                onValueChange={(value) => handleRoleUpdate(user.id, value)}
                                disabled={updating[user.id] === 'role' || !user.phone_number}
                              >
                                <SelectTrigger className="w-40">
                                  {updating[user.id] === 'role' ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : null}
                                  <SelectValue placeholder="Change Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="customer">Customer</SelectItem>
                                  <SelectItem value="vendor">Vendor</SelectItem>
                                  <SelectItem value="agent">Agent</SelectItem>
                                  <SelectItem value="driver">Driver</SelectItem>
                                </SelectContent>
                              </Select>
                            )}

                            {!user.phone_number && user.role !== 'admin' && (
                              <Badge variant="destructive">
                                Phone required for role change
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
