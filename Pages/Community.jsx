
import React from "react";
import { AppSettings } from "@/entities/AppSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Heart,
  Search,
  Shield,
  Users,
  Plus,
  MapPin,
  Phone
} from "lucide-react";

const CommunityServiceCard = ({ icon: Icon, title, description, color, comingSoon = false, href, onClick }) => {
  const cardContent = (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm ${comingSoon ? 'opacity-60' : ''} h-full flex flex-col`}>
      <CardContent className="p-6 text-center flex-grow">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${color} flex items-center justify-center transform ${comingSoon ? '' : 'group-hover:scale-110'} transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
      </CardContent>
      <div className="p-4 pt-0">
        {comingSoon ? (
          <Button disabled className="w-full">
            Coming Soon
          </Button>
        ) : (
          <Button onClick={onClick} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Explore
          </Button>
        )}
      </div>
    </Card>
  );

  if (href && !onClick) {
    return <Link to={href}>{cardContent}</Link>;
  }
  return cardContent;
};

export default function Community() {

  const handleHelplineClick = async () => {
    try {
      const settings = await AppSettings.list();
      const contactNumber = settings.length > 0 ? settings[0].admin_whatsapp : '+971501234567';
      const message = "Hello, I need urgent assistance from the community helpline.";
      window.open(`https://wa.me/${contactNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
    } catch (error) {
      console.error("Could not get helpline number", error);
      alert("Helpline contact is currently unavailable. Please try again later.");
    }
  };
  
  const services = [
    {
      icon: Heart,
      title: "Donations",
      description: "Support fellow community members in need through donations and fundraising",
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      href: createPageUrl("Donations")
    },
    {
      icon: Search,
      title: "Lost and Found",
      description: "Help locate missing items and reunite them with their owners",
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      href: createPageUrl("LostAndFound")
    },
    {
      icon: Shield,
      title: "Emergency Services",
      description: "Quick access to emergency contacts and community support",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      href: createPageUrl("EmergencyServices")
    },
    {
      icon: Users,
      title: "Community Groups",
      description: "Join groups based on your interests, nationality, or location",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      comingSoon: true
    },
    {
      icon: Phone,
      title: "Helpline",
      description: "24/7 support line for urgent community assistance",
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      onClick: handleHelplineClick
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-indigo-600" />
            Community Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect, support, and grow together as one African community in the UAE
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold mb-2">5,000+</h3>
              <p className="text-indigo-100">Community Members</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold mb-2">200+</h3>
              <p className="text-purple-100">Support Cases Resolved</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold mb-2">AED 50K+</h3>
              <p className="text-pink-100">Donations Facilitated</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Community Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <CommunityServiceCard key={index} {...service} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16 opacity-10"></div>
          <CardContent className="p-8 text-center relative">
            <h3 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h3>
            <p className="text-indigo-100 mb-6 text-lg">
              Join thousands of community members who are already making an impact
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Donations")}>
                <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                  <Plus className="w-5 h-5 mr-2" />
                  Start Helping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
