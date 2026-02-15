import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Shield, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const emergencyServices = [
  { name: "Dubai Police (Emergency)", number: "999", category: "Police" },
  { name: "Ambulance", number: "998", category: "Medical" },
  { name: "Fire Department (Civil Defence)", number: "997", category: "Fire" },
  { name: "Community Helpline", number: "+971501234567", category: "Support" },
];

export default function EmergencyServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Community")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Services</h1>
        </div>
        <div className="space-y-4">
          {emergencyServices.map(service => (
            <Card key={service.name}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.category}</p>
                </div>
                <a href={`tel:${service.number}`}>
                  <Button>
                    <Phone className="w-4 h-4 mr-2" /> Call {service.number}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}