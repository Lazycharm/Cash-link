import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, FileText, Bell, Clock, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

const ToolCard = ({ icon: Icon, title, description, comingSoon = false }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 ${comingSoon ? 'opacity-70 grayscale' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${comingSoon ? 'bg-gray-100' : 'bg-amber-50'}`}>
      <Icon className={`w-6 h-6 ${comingSoon ? 'text-gray-400' : 'text-amber-600'}`} />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {comingSoon && <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">SOON</span>}
      </div>
      <p className="text-xs text-gray-500 leading-snug">{description}</p>
    </div>
  </motion.div>
);

export default function UtilityTools() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-amber-500 text-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Utility Tools</h1>
        </div>
        <p className="text-amber-50 opacity-90 max-w-sm">
          Daily tools to organize your documents and stay on top of deadlines.
        </p>
      </div>

      <div className="px-6 max-w-3xl mx-auto grid grid-cols-1 gap-4">
        <ToolCard 
          icon={Camera} 
          title="Passport Photo Gen" 
          description="Create compliant passport photos from selfies." 
          comingSoon 
        />
        <ToolCard 
          icon={FileText} 
          title="Document Organizer" 
          description="Securely store copies of your Emirates ID, Visa, and Passport." 
          comingSoon 
        />
        <ToolCard 
          icon={Clock} 
          title="Visa Expiry Reminder" 
          description="Set alerts for your visa and passport expiration dates." 
          comingSoon 
        />
        <ToolCard 
          icon={Bell} 
          title="Bill Reminders" 
          description="Track DEWA, Etisalat, and Du payment dates." 
          comingSoon 
        />
         <ToolCard 
          icon={FileCheck} 
          title="PDF Merge Tool" 
          description="Combine multiple PDF documents into one file." 
          comingSoon 
        />
      </div>
    </div>
  );
}