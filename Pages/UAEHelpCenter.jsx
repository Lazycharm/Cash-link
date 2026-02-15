import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Calculator, Building, AlertTriangle, Shield, Scale } from "lucide-react";
import { motion } from "framer-motion";

const HelpCard = ({ icon: Icon, title, description, link, external = false }) => (
  <motion.a 
    href={external ? link : "#"} 
    target={external ? "_blank" : "_self"}
    className="block"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden h-full">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  </motion.a>
);

export default function UAEHelpCenter() {
  const tools = [
    {
      icon: FileText,
      title: "Visa Status Check",
      description: "Check the validity of your residence or visit visa via ICP.",
      link: "https://smartservices.icp.gov.ae/",
      external: true
    },
    {
      icon: Calculator,
      title: "Overstay Fine Calculator",
      description: "Estimate fines for visa overstay days.",
      link: "#calculator",
      external: false
    },
    {
      icon: Building,
      title: "Rent Increase Check",
      description: "Official RERA calculator for rental increases.",
      link: "https://dubailand.gov.ae/en/eservices/rental-index",
      external: true
    },
    {
      icon: AlertTriangle,
      title: "Lost Passport Process",
      description: "Step-by-step guide: Police report to Embassy visit.",
      link: "#lost-passport",
      external: false
    },
    {
      icon: Scale,
      title: "Labor Rights (MOHRE)",
      description: "File complaints for unpaid salary or arbitrary dismissal.",
      link: "https://www.mohre.gov.ae/",
      external: true
    },
    {
      icon: Shield,
      title: "Police Services",
      description: "Apply for Good Conduct Certificate or report lost items.",
      link: "https://www.dubaipolice.gov.ae/",
      external: true
    }
  ];

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
                {[
                  { name: "Nigeria Embassy", loc: "Villa 14, Jumeirah 2, Dubai" },
                  { name: "Kenya Consulate", loc: "Jumeirah Beach Road, Dubai" },
                  { name: "Ghana Consulate", loc: "Villa 56, Al Satwa" },
                  { name: "Uganda Consulate", loc: "Villa 23, Al Jafiliya" }
                ].map((embassy, i) => (
                  <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{embassy.name}</p>
                      <p className="text-xs text-gray-500">{embassy.loc}</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-8">Map</Button>
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}