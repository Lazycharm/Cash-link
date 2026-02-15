
import React, { useState, useEffect } from "react";
import { SubscriptionRequest } from "@/entities/SubscriptionRequest";
import { Notification } from "@/entities/Notification";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminSubscriptionManagement() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Corrected the list call to sort by most recent
      const allRequests = await SubscriptionRequest.list('-created_date');
      setRequests(allRequests);
    } catch (error) {
      console.error("Error fetching subscription requests:", error);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      await SubscriptionRequest.update(id, { status });
      // Send notification to user
      const request = requests.find(r => r.id === id);
      if (request) {
        const statusMessages = {
          'paid': `Your payment for "${request.package_name}" has been confirmed. Awaiting final approval.`,
          'approved': `Your subscription for "${request.package_name}" has been approved!`,
          'rejected': `Your subscription request for "${request.package_name}" has been rejected.`,
          'completed': `Your subscription for "${request.package_name}" is now active!`
        };
        await Notification.create({
          user_id: request.user_id,
          message: statusMessages[status] || `Your subscription status has been updated to ${status}.`,
          type: status === 'rejected' ? 'warning' : 'success'
        });
      }
      fetchRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(`Failed to update request status: ${error.message || 'Unknown error'}`);
    }
    setUpdating(prev => ({ ...prev, [id]: false }));
  };

  const handleApprove = async (id) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      // Get the subscription request
      const request = requests.find(r => r.id === id);
      if (!request) {
        throw new Error("Subscription request not found");
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (request.duration_days || 30));

      // Update subscription request status to completed
      await SubscriptionRequest.update(id, { status: 'completed' });

      // Update user subscription status
      await User.update(request.user_id, {
        subscription_status: 'active',
        subscription_expires: expiresAt.toISOString()
      });

      // Notify user
      await Notification.create({
        user_id: request.user_id,
        message: `Your ${request.package_name} subscription has been activated! Valid until ${expiresAt.toLocaleDateString()}.`,
        type: 'success',
        link: '/profile'
      });

      await fetchRequests();
      alert("✅ Subscription approved successfully!");
    } catch (error) {
      console.error("Failed to approve subscription:", error);
      alert(`❌ Failed to approve subscription: ${error.message}`);
    }
    setUpdating(prev => ({ ...prev, [id]: false }));
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("AdminDashboard")}>
            <Button variant="outline" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-1">Approve and manage user subscriptions.</p>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Subscription Requests</CardTitle></CardHeader>
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
                      <TableHead>User ID</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.user_id}</TableCell>
                        <TableCell className="capitalize">{req.package_name}</TableCell>
                        <TableCell>AED {req.cost}</TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getBadgeClass(req.status)}`}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {updating[req.id] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              {req.status === 'pending' && (
                                <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => handleStatusUpdate(req.id, 'paid')}>Mark as Paid</Button>
                              )}
                              {req.status === 'paid' && (
                                <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove(req.id)}>Approve</Button>
                              )}
                              {req.status !== 'completed' && req.status !== 'rejected' && (
                                <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(req.id, 'rejected')}>Reject</Button>
                              )}
                            </>
                          )}
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
