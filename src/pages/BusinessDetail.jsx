
import React, { useState, useEffect } from "react";
import { Business } from "@/entities/Business";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Phone,
  Mail,
  Clock,
  Star,
  Edit,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  TrendingUp // Added TrendingUp icon
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";

const BusinessDetail = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('id');
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const loadBusinessData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me().catch(() => null);
      setUser(currentUser);

      const businesses = await Business.filter({ id: businessId });
      if (businesses.length > 0) {
        const foundBusiness = businesses[0];
        setBusiness(foundBusiness);
        await Business.update(foundBusiness.id, { views_count: (foundBusiness.views_count || 0) + 1 });
      } else {
        console.error("Business not found");
        setBusiness(null);
      }
    } catch (error) {
      console.error("Failed to load business data:", error);
      setBusiness(null);
    }
    setIsLoading(false);
  };
  
  const nextImage = () => {
    if (business?.images && business.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % business.images.length);
    }
  };

  const prevImage = () => {
    if (business?.images && business.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + business.images.length) % business.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <Link to={createPageUrl("Businesses")}>
            <Button>Back to Businesses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user && (user.id === business.owner_id || user.role === 'admin');

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Businesses")}>
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{business.name}</h1>
          </div>
          {canEdit && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to={createPageUrl(`EditBusiness?id=${business.id}`)}>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Listing
                </Button>
              </Link>
              <Link to={createPageUrl(`PromoteContent?type=business&id=${business.id}`)}>
                <Button variant="outline" className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 text-sm px-4 py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Promote
                </Button>
              </Link>
            </div>
          )}
        </div>

        {business.images && business.images.length > 0 && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="relative h-64 md:h-96 bg-gray-200">
              <img 
                src={business.images[currentImageIndex]}
                alt={business.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                key={currentImageIndex}
              />
              {business.is_featured && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              
              {business.images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {business.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-gray-900 mb-2">{business.name}</CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{business.location?.address || `${business.location?.city}, ${business.location?.emirate}`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={categoryColors[business.category] || categoryColors.other}>
                    {business.category?.replace('_', ' ') || 'Other'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-700">{business.rating?.toFixed(1) || '4.5'}</span>
                    <span className="text-gray-500 text-sm">({business.reviews_count || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{business.description}</p>
            </div>

            {business.hours && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Opening Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(business.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-1">
                      <span className="capitalize text-gray-600">{day}:</span>
                      <span className="font-medium text-gray-900">{hours || 'Closed'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3">
                {business.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">{business.contact.phone}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`tel:${business.contact.phone}`, '_self')}
                    >
                      Call
                    </Button>
                  </div>
                )}
                
                {business.contact?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">{business.contact.email}</span>
                  </div>
                )}

                {business.contact?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <a 
                      href={business.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {business.contact.website}
                    </a>
                  </div>
                )}

                {business.contact?.whatsapp && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(`https://wa.me/${business.contact.whatsapp.replace(/\+/g, '')}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact via WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDetail;
