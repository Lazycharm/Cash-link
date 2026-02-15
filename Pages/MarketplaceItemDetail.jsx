import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MarketplaceItem } from "@/entities/MarketplaceItem";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Share2, 
  Heart, 
  Flag, 
  MessageCircle, 
  Phone, 
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketplaceItemDetail() {
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get ID from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const itemId = searchParams.get("id");

  useEffect(() => {
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  const loadItem = async () => {
    try {
      const foundItem = await MarketplaceItem.get(itemId);
      if (foundItem) {
        setItem(foundItem);
        // Fetch seller details
        const sellerData = await User.get(foundItem.seller_id);
        setSeller(sellerData);
      }
    } catch (error) {
      console.error("Failed to load item", error);
    }
    setLoading(false);
  };

  const nextImage = () => {
    if (item?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
        <p className="text-gray-600 mb-6">The item you are looking for has been removed or does not exist.</p>
        <Link to={createPageUrl("Marketplace")}>
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 
    ? item.images 
    : ["https://via.placeholder.com/800x600?text=No+Image"];

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Navbar Placeholder for consistency if needed, but layout usually handles it */}
      
      <div className="max-w-6xl mx-auto pt-6 px-4 md:px-8">
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
           <Link to={createPageUrl("Marketplace")} className="hover:text-emerald-600 flex items-center gap-1">
             <ArrowLeft className="w-4 h-4" /> Marketplace
           </Link>
           <span>/</span>
           <span className="capitalize">{item.category}</span>
           <span>/</span>
           <span className="text-gray-900 truncate max-w-[200px]">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: IMAGES */}
            <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden group shadow-lg">
                    <img 
                        src={images[currentImageIndex]} 
                        alt={item.title} 
                        className="w-full h-full object-contain"
                    />
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                    
                    <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-full text-white text-xs">
                        {currentImageIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                                    currentImageIndex === idx ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Description & Details Mobile Order */}
                <Card className="border-0 shadow-sm block lg:hidden">
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
                        <p className="text-3xl font-bold text-gray-900 mb-4">AED {item.price?.toLocaleString()}</p>
                        <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: DETAILS & SELLER */}
            <div className="space-y-6">
                
                {/* Main Info Card */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{item.title}</h1>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                                    <Heart className="w-5 h-5 text-gray-600" />
                                </Button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-3xl font-bold text-emerald-700">AED {item.price?.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Listed {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })} in {item.location?.city}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                             <div className="bg-gray-50 p-3 rounded-lg">
                                 <p className="text-xs text-gray-500 uppercase tracking-wide">Condition</p>
                                 <p className="font-semibold capitalize">{item.condition?.replace('_', ' ')}</p>
                             </div>
                             <div className="bg-gray-50 p-3 rounded-lg">
                                 <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                                 <p className="font-semibold capitalize">{item.category}</p>
                             </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900">Seller Information</h3>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12 border">
                                    <AvatarImage src={seller?.profile_image} />
                                    <AvatarFallback>{seller?.full_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-gray-900">{seller?.full_name || 'CashLink User'}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                        <span>Verified Seller</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {item.contact?.whatsapp ? (
                                    <Button 
                                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                                        onClick={() => window.open(`https://wa.me/${item.contact.whatsapp.replace(/\D/g,'')}?text=Hi, I'm interested in your ${item.title} listed on CashLink`, '_blank')}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                                    </Button>
                                ) : (
                                    <Button className="w-full" disabled>No WhatsApp</Button>
                                )}
                                
                                {item.contact?.phone ? (
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => window.location.href = `tel:${item.contact.phone}`}
                                    >
                                        <Phone className="w-4 h-4 mr-2" /> Call
                                    </Button>
                                ) : (
                                     <Button variant="outline" className="w-full" disabled>No Phone</Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Description Card (Desktop) */}
                <Card className="border-0 shadow-sm hidden lg:block">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">Description</h3>
                        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                            {item.description}
                        </div>
                    </CardContent>
                </Card>

                {/* Location Map Placeholder */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" /> 
                            Location
                        </h3>
                        <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between">
                             <div className="flex flex-col">
                                 <span className="font-semibold text-gray-900">{item.location?.city}, {item.location?.emirate}</span>
                                 <span className="text-xs text-gray-500">{item.location?.address}</span>
                             </div>
                             <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                 Get Directions
                             </Button>
                        </div>
                        {/* A real map integration would go here */}
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button variant="ghost" className="text-gray-400 hover:text-red-500 text-sm">
                        <Flag className="w-4 h-4 mr-2" /> Report this listing
                    </Button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}