import React, { useState, useEffect } from "react";
import { Business } from "@/entities/Business";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminBusinessManagement() {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const allBusinesses = await Business.list();
      setBusinesses(allBusinesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (businessId, status) => {
    const originalBusinesses = [...businesses];
    const updatedBusinesses = businesses.map(b => 
      b.id === businessId ? { ...b, status: status } : b
    );
    setBusinesses(updatedBusinesses);

    try {
      await Business.update(businessId, { status: status });
    } catch (error) {
      console.error("Failed to update business status:", error);
      setBusinesses(originalBusinesses);
    }
  };

  const getBadgeClass = (status) => {
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
            <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
            <p className="text-gray-600 mt-1">Review and approve business listings.</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Business Listings ({businesses.length})</CardTitle>
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
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>{business.owner_id}</TableCell>
                        <TableCell className="capitalize">{business.category.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getBadgeClass(business.status)}`}>
                            {business.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {business.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(business.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(business.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                              </Button>
                            </div>
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