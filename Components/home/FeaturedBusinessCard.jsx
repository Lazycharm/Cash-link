import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function FeaturedBusinessCard({ business }) {
  const categoryColors = {
    restaurant: "bg-red-100 text-red-700",
    transport: "bg-blue-100 text-blue-700",
    grocery: "bg-green-100 text-green-700",
    services: "bg-purple-100 text-purple-700",
    entertainment: "bg-pink-100 text-pink-700",
    retail: "bg-amber-100 text-amber-700",
    other: "bg-gray-100 text-gray-700"
  };

  return (
    <Link to={createPageUrl('Businesses')}>
      <Card className="group overflow-hidden relative h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
        <div className="h-40 bg-gray-200">
          <img src={business.images?.[0] || 'https://placehold.co/400x300/e2e8f0/e2e8f0'} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <CardContent className="p-4">
          <Badge className={`mb-2 text-xs ${categoryColors[business.category] || categoryColors.other}`}>{business.category.replace('_', ' ')}</Badge>
          <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors truncate">{business.name}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{business.location?.city}, {business.location?.emirate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
            <span>{business.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}