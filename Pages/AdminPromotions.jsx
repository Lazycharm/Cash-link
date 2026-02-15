
import React, { useState, useEffect } from "react";
import { PromotionRequest } from "@/entities/PromotionRequest";
import { MarketplaceItem } from "@/entities/MarketplaceItem"; 
import { Business } from "@/entities/Business"; 
import { Event } from "@/entities/Event"; 
import { Notification } from "@/entities/Notification"; 
import { approvePromotion } from "@/functions/approvePromotion"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Loader2,
  ArrowLeft,
  XCircle,
  Clock,
} from "lucide-react"; 
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminPromotions() {
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
      const allRequests = await PromotionRequest.list('-created_date');
      setRequests(allRequests);
    } catch (error) {
      console.error("Error fetching promotion requests:", error);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      await PromotionRequest.update(id, { status });
      // Send notification to user
      const request = requests.find(r => r.id === id);
      if (request) {
        await Notification.create({
          user_id: request.user_id,
          message: `Admin has marked your promotion request for "${request.entity_title}" as ${status}.`,
          type: "info"
        });
      }
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update request status."); 
    }
    setUpdating(prev => ({ ...prev, [id]: false }));
  };

  const handleApprove = async (id) => { 
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      // Call the function directly, not through .invoke
      const response = await approvePromotion({ promotionRequestId: id });
      
      if (response.data && response.data.success) {
        await fetchRequests(); // Refresh the list after successful approval
        alert("Promotion approved successfully!");
      } else {
        throw new Error(response.data?.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Failed to approve promotion:", error);
      alert(`Failed to approve promotion. Error: ${error.message}`); 
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
            <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
            <p className="text-gray-600 mt-1">Approve and manage user promotion requests.</p>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Promotion Requests</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
              </div>
            ) : (
              <div className="overflow-x-auto"> 
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead> 
                      <TableHead>User ID</TableHead> 
                      <TableHead>Type</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.entity_title}</TableCell>
                        <TableCell>{req.user_id}</TableCell> 
                        <TableCell className="capitalize">{req.entity_type?.replace('_', ' ')}</TableCell> 
                        <TableCell>AED {req.promotion_cost}</TableCell>
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
