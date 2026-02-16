
import React from "react";
import { AppSettings } from "@/entities/AppSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Heart,
  Search,
  Shield,
  Users,
  Plus,
  Phone
} from "lucide-react";

const CommunityServiceCard = ({ icon: Icon, title, description, color, comingSoon = false, href, onClick }) => {
  const cardContent = (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-0 bg-white ${comingSoon ? 'opacity-60' : ''} h-full flex flex-col overflow-hidden`}>
      <CardContent className="p-4 sm:p-6 text-center flex-grow flex flex-col">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl ${color} flex items-center justify-center transform ${comingSoon ? '' : 'group-hover:scale-110'} transition-transform duration-300`}>
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">{title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 flex-grow">{description}</p>
        {comingSoon ? (
          <Button disabled className="w-full text-xs sm:text-sm py-2 sm:py-3 mt-auto">
            Coming Soon
          </Button>
        ) : (
          <Button 
            onClick={onClick} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm py-2 sm:py-3 mt-auto"
          >
            Explore
          </Button>
        )}
      </CardContent>
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl"
      >
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white rounded-full blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-400 rounded-full blur-[80px] opacity-20"></div>
        
        <div className="relative z-10 p-6 sm:p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
            <div className="space-y-3 sm:space-y-4 max-w-lg w-full">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10">
                <Users className="w-4 h-4 text-white" />
                <span className="text-[10px] sm:text-xs font-medium text-white tracking-wide uppercase">Community Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                Connect, Support & Grow Together
              </h1>
              <p className="text-indigo-100/90 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-md">
                Join thousands of African community members in the UAE making a positive impact every day.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">5,000+</h3>
              <p className="text-sm sm:text-base text-indigo-100">Community Members</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">200+</h3>
              <p className="text-sm sm:text-base text-purple-100">Support Cases Resolved</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">AED 50K+</h3>
              <p className="text-sm sm:text-base text-pink-100">Donations Facilitated</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Services Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Community Services</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <CommunityServiceCard {...service} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16 opacity-10"></div>
          <CardContent className="p-6 sm:p-8 text-center relative">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Ready to Make a Difference?</h3>
            <p className="text-sm sm:text-base md:text-lg text-indigo-100 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Join thousands of community members who are already making an impact. Together we can build a stronger, more connected community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to={createPageUrl("Donations")} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-100 text-sm sm:text-base px-6 py-2 sm:py-3 h-auto">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Helping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
