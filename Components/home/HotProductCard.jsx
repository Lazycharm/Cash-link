import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MapPin } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function HotProductCard({ item }) {
  return (
    <Link to={createPageUrl('Marketplace')}>
      <Card className="group overflow-hidden relative h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
        <div className="h-40 bg-gray-200 relative">
          <img src={item.images?.[0] || 'https://placehold.co/400x300/e2e8f0/e2e8f0'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white">Hot</Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors truncate">{item.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-green-600 font-bold">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>{item.price}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{item.location?.city}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}