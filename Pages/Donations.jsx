import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Mock data, to be replaced with entity calls
const donationCampaigns = [
  { id: 1, title: "Support for John's Medical Bills", current: 4500, target: 10000, image: "https://images.unsplash.com/photo-1599045118108-bf9954418b76?w=400&h=200&fit=crop" },
  { id: 2, title: "Help Mary Start Her Small Business", current: 1200, target: 5000, image: "https://images.unsplash.com/photo-1579621970795-87f91d96de30?w=400&h=200&fit=crop" },
  { id: 3, title: "Community Youth Sports Program", current: 8000, target: 8000, image: "https://images.unsplash.com/photo-1562774053-69324344e1f8?w=400&h=200&fit=crop" },
];

export default function DonationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Community")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {donationCampaigns.map(campaign => (
            <Card key={campaign.id} className="overflow-hidden">
              <img src={campaign.image} alt={campaign.title} className="w-full h-40 object-cover" />
              <CardHeader>
                <CardTitle>{campaign.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(campaign.current / campaign.target) * 100} className="mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-800">AED {campaign.current.toLocaleString()}</span> raised of AED {campaign.target.toLocaleString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-pink-600 hover:bg-pink-700">
                  <Heart className="w-4 h-4 mr-2" /> Donate Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}