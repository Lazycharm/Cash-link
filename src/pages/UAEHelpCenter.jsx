import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Calculator, Building, AlertTriangle, Shield, Scale, MapPin, Loader2, MessageCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { SiteContent } from "@/entities/SiteContent";
import { AppSettings } from "@/entities/AppSettings";
import NearbyMap from "@/components/map/NearbyMap";

// Icon mapping - dynamically import from lucide-react
const iconComponents = {
  FileText,
  Calculator,
  Building,
  AlertTriangle,
  Shield,
  Scale,
  MapPin,
};

const HelpCard = ({ icon, title, description, link, external = false }) => {
  const IconComponent = iconComponents[icon] || FileText;
  
  return (
    <motion.a 
      href={external ? link : link.startsWith('#') ? link : '#'} 
      target={external ? "_blank" : "_self"}
      rel={external ? "noopener noreferrer" : undefined}
      className="block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden h-full">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.a>
  );
};

export default function UAEHelpCenter() {
  const [tools, setTools] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    fetchData();
    fetchAppSettings();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const helpCenterData = await SiteContent.getByKey('uae-help-center');
      
      if (helpCenterData && helpCenterData.content) {
        const data = JSON.parse(helpCenterData.content);
        setTools(data.tools || []);
        setDirectories(data.directories || []);
      } else {
        // Fallback to default data if not found
        const defaultTools = [
          {
            icon: 'FileText',
            title: "Visa Status Check",
            description: "Check the validity of your residence or visit visa via ICP.",
            link: "https://smartservices.icp.gov.ae/",
            external: true
          },
          {
            icon: 'Calculator',
            title: "Overstay Fine Calculator",
            description: "Estimate fines for visa overstay days.",
            link: "#calculator",
            external: false
          },
          {
            icon: 'Building',
            title: "Rent Increase Check",
            description: "Official RERA calculator for rental increases.",
            link: "https://dubailand.gov.ae/en/eservices/rental-index",
            external: true
          },
          {
            icon: 'AlertTriangle',
            title: "Lost Passport Process",
            description: "Step-by-step guide: Police report to Embassy visit.",
            link: "#lost-passport",
            external: false
          },
          {
            icon: 'Scale',
            title: "Labor Rights (MOHRE)",
            description: "File complaints for unpaid salary or arbitrary dismissal.",
            link: "https://www.mohre.gov.ae/",
            external: true
          },
          {
            icon: 'Shield',
            title: "Police Services",
            description: "Apply for Good Conduct Certificate or report lost items.",
            link: "https://www.dubaipolice.gov.ae/",
            external: true
          }
        ];
        
        const defaultDirectories = [
          { name: "Nigeria Embassy", location: "Villa 14, Jumeirah 2, Dubai", latitude: 25.2048, longitude: 55.2708 },
          { name: "Kenya Consulate", location: "Jumeirah Beach Road, Dubai", latitude: 25.2048, longitude: 55.2708 },
          { name: "Ghana Consulate", location: "Villa 56, Al Satwa", latitude: 25.2048, longitude: 55.2708 },
          { name: "Uganda Consulate", location: "Villa 23, Al Jafiliya", latitude: 25.2048, longitude: 55.2708 }
        ];
        
        setTools(defaultTools);
        setDirectories(defaultDirectories);
      }
    } catch (error) {
      console.error("Error fetching UAE Help Center data:", error);
      // Set empty arrays on error
      setTools([]);
      setDirectories([]);
    }
    setIsLoading(false);
  };

  const fetchAppSettings = async () => {
    try {
      const settings = await AppSettings.get();
      setAppSettings(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
    }
  };

  const handleRequestMore = () => {
    const message = `Hello, I would like to request adding more tools, links, or directory locations to the UAE Help Center on CashLink.`;
    const adminWhatsapp = (appSettings?.admin_whatsapp || "+971501234567").replace(/\D/g, '');
    
    if (adminWhatsapp) {
      window.open(`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      alert("Support WhatsApp number is not configured. Please contact support through other channels.");
    }
  };

  const handleMapClick = (directory) => {
    if (directory.latitude && directory.longitude) {
      setSelectedDirectory(directory);
      setShowMap(true);
    } else {
      // Open Google Maps search if no coordinates
      const query = encodeURIComponent(`${directory.name}, ${directory.location}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading help center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-green-700 text-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">UAE Help Center</h1>
        </div>
        <p className="text-green-50 opacity-90 max-w-sm">
          Your official survival guide for life in the UAE. Official links, tools, and guidance.
        </p>
      </div>

      <div className="px-6 max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool, index) => (
            <HelpCard key={index} {...tool} />
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Important Directories</h2>
          <Card className="border-0 shadow-sm">
             <CardContent className="p-0 divide-y divide-gray-100">
                {directories.map((directory, i) => (
                  <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{directory.name}</p>
                      <p className="text-xs text-gray-500">{directory.location}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => handleMapClick(directory)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Map
                    </Button>
                  </div>
                ))}
                {directories.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">No directories available</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Request More Button */}
        <div className="mt-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleRequestMore}
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Request More Tools or Links
              <MessageCircle className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Need something else? Request it via WhatsApp
          </p>
        </div>

        {/* Map Dialog for Directory */}
        {showMap && selectedDirectory && selectedDirectory.latitude && selectedDirectory.longitude && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMap(false)}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedDirectory.name}</h3>
                  <p className="text-sm text-gray-600">{selectedDirectory.location}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowMap(false)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <NearbyMap
                  markers={[{
                    id: selectedDirectory.name,
                    lat: selectedDirectory.latitude,
                    lng: selectedDirectory.longitude,
                    name: selectedDirectory.name,
                    distance: null,
                  }]}
                  markerType="agent"
                  height={500}
                  showUserLocation={false}
                />
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const query = encodeURIComponent(`${selectedDirectory.name}, ${selectedDirectory.location}`);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    Open in Google Maps
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedDirectory.latitude},${selectedDirectory.longitude}`, '_blank');
                    }}
                  >
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}