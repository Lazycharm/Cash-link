import React, { useState, useEffect } from 'react';
import { Business } from '@/entities/Business';
import { Event } from '@/entities/Event';
import { Job } from '@/entities/Job';
import { MarketplaceItem } from '@/entities/MarketplaceItem';
import { Notification } from '@/entities/Notification';
import { approveContent } from '@/functions/approveContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Briefcase,
  Store,
  Calendar,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminContentManagement() {
    const [pendingItems, setPendingItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState({});

    const fetchPendingItems = async () => {
        setIsLoading(true);
        try {
            const results = await Promise.allSettled([
                Business.filter({ status: 'pending' }).then(res => res.map(item => ({ ...item, type: 'Business' }))),
                Event.filter({ status: 'pending' }).then(res => res.map(item => ({ ...item, type: 'Event' }))),
                Job.filter({ status: 'pending' }).then(res => res.map(item => ({ ...item, type: 'Job' }))),
                MarketplaceItem.filter({ status: 'pending' }).then(res => res.map(item => ({ ...item, type: 'Marketplace Item' })))
            ]);

            const allItems = results
                .filter(result => result.status === 'fulfilled')
                .flatMap(result => result.value);
            
            allItems.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            setPendingItems(allItems);

        } catch (error) {
            console.error("Error fetching pending items:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const handleApproval = async (item, newStatus) => {
        setUpdating(prev => ({ ...prev, [item.id]: true }));
        try {
            const result = await approveContent({
                entity: item.type.replace(' ', ''), // 'Marketplace Item' -> 'MarketplaceItem'
                itemId: item.id,
                status: newStatus
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            // Optimistically remove from list
            setPendingItems(prev => prev.filter(p => p.id !== item.id));

        } catch (error) {
            console.error(`Failed to ${newStatus} content:`, error);
            alert(`Failed to update content. Error: ${error.message}`);
        }
        setUpdating(prev => ({ ...prev, [item.id]: false }));
    };

    const typeDetails = {
        Business: { icon: Store, color: "text-purple-600" },
        Event: { icon: Calendar, color: "text-blue-600" },
        Job: { icon: Briefcase, color: "text-green-600" },
        'Marketplace Item': { icon: ShoppingBag, color: "text-pink-600" }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to={createPageUrl("AdminDashboard")}>
                        <Button variant="outline" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                        <p className="text-gray-600 mt-1">Approve or reject user-submitted content.</p>
                    </div>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Pending Approvals ({pendingItems.length})</CardTitle>
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
                                            <TableHead>Type</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Submitted By</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan="5" className="text-center h-24">No pending items.</TableCell>
                                            </TableRow>
                                        ) : (
                                            pendingItems.map((item) => {
                                                const { icon: Icon, color } = typeDetails[item.type];
                                                return (
                                                    <TableRow key={item.id}>
                                                        <TableCell><Badge variant="outline" className={`capitalize ${color} border-current`}><Icon className="w-4 h-4 mr-2" />{item.type}</Badge></TableCell>
                                                        <TableCell className="font-medium">{item.title}</TableCell>
                                                        <TableCell>{item.created_by}</TableCell>
                                                        <TableCell>{new Date(item.created_date).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            {updating[item.id] ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApproval(item, 'approved')}><CheckCircle className="w-4 h-4 mr-2" />Approve</Button>
                                                                    <Button size="sm" variant="destructive" onClick={() => handleApproval(item, 'rejected')}><XCircle className="w-4 h-4 mr-2" />Reject</Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
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