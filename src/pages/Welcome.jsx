import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertCurrency } from "@/integrations/Core";
import { 
  DollarSign, 
  Store, 
  Users, 
  Shield, 
  MapPin,
  ArrowRight,
  Star,
  Globe,
  RefreshCw
} from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
    <CardContent className="p-6 text-center">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const AfricanPattern = ({ className = "" }) => (
  <div className={`absolute inset-0 ${className}`}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="fill-current opacity-10">
      <pattern id="welcome-pattern" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
        <path d="M3,3 L12,12 M12,3 L3,12" stroke="currentColor" strokeWidth="0.3"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#welcome-pattern)"/>
    </svg>
  </div>
);

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currencies = [
    { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
    { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪" },
    { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
    { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
    { code: "UGX", name: "Ugandan Shilling", flag: "🇺🇬" },
    { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿" },
    { code: "ETB", name: "Ethiopian Birr", flag: "🇪🇹" },
    { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬" }
  ];

  const handleConvert = async () => {
    if (!amount || !fromCurrency) return;
    
    setIsLoading(true);
    try {
      // Use free currency API instead of InvokeLLM
      const aedResult = await convertCurrency(parseFloat(amount), fromCurrency, 'AED');
      const usdResult = await convertCurrency(parseFloat(amount), fromCurrency, 'USD');
      
      setResults({
        aed_amount: aedResult.convertedAmount,
        usd_amount: usdResult.convertedAmount,
        aed_rate: aedResult.rate,
        usd_rate: usdResult.rate
      });
    } catch (error) {
      console.error("Currency conversion failed:", error);
    }
    setIsLoading(false);
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Currency Converter</h3>
          <p className="text-gray-600">Convert African currencies to AED and USD</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Currency</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code} - {currency.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleConvert} 
              disabled={isLoading || !amount || !fromCurrency}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Convert
            </Button>
          </div>
        </div>
        
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">🇦🇪 AED {results.aed_amount?.toFixed(2)}</div>
                <div className="text-sm text-blue-600">Rate: 1 {fromCurrency} = {results.aed_rate?.toFixed(4)} AED</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">🇺🇸 USD {results.usd_amount?.toFixed(2)}</div>
                <div className="text-sm text-green-600">Rate: 1 {fromCurrency} = {results.usd_rate?.toFixed(4)} USD</div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Welcome() {
  const features = [
    {
      icon: DollarSign,
      title: "GetCash Service",
      description: "Find nearby agents to withdraw or deposit money using Mobile Money services",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      icon: Store,
      title: "African Businesses",
      description: "Discover authentic African restaurants, shops, and services in the UAE",
      color: "bg-gradient-to-br from-amber-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Connect with fellow Africans through events, jobs, and marketplace",
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "KYC verified agents and vendors with admin-approved listings",
      color: "bg-gradient-to-br from-blue-500 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 relative overflow-hidden">
      <AfricanPattern className="text-green-500" />
      
      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">CL</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-xl">CashLink</h1>
              <p className="text-green-600 text-sm font-medium">Your African Community in UAE</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20 px-4">
          <div className="mb-6 md:mb-8 relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-green-500 to-amber-500 bg-clip-text text-transparent">
                CashLink
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Your trusted platform for financial services, business connections, and community engagement in the UAE
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12 px-4">
            <Link to="/login">
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Sign In
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>

            <Link to="/signup">
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Create Account
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center mb-12">
            <p className="text-gray-600 text-sm">
              Sign in with Google or email to get started
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto mb-12 md:mb-16 px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Verified Agents</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-2">200+</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Local Businesses</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">10k+</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Happy Users</p>
            </div>
          </div>
        </div>

        {/* Currency Converter */}
        <div className="mb-20">
          <CurrencyConverter />
        </div>

        {/* Features Grid - 2 per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-20 px-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Services Overview */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden">
          <AfricanPattern className="text-green-500" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Services</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Location-Based Services</h4>
                <p className="text-gray-600 leading-relaxed">
                  Find the nearest agents and businesses based on your location in Dubai, Abu Dhabi, and across the UAE
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Multi-Language Support</h4>
                <p className="text-gray-600 leading-relaxed">
                  Available in English, Swahili, Luganda, and Arabic to serve our diverse African community
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Trusted Community</h4>
                <p className="text-gray-600 leading-relaxed">
                  All users are verified through KYC processes, ensuring a safe and trusted environment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden">
          <AfricanPattern className="text-blue-500" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xl">
                  1
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Sign Up</h4>
                <p className="text-gray-600 leading-relaxed">
                  Create your account using Google and choose your role (Customer, Vendor, or Agent)
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center font-bold text-white text-xl">
                  2
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Complete Profile</h4>
                <p className="text-gray-600 leading-relaxed">
                  Add your details, location, and contact information to get verified
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-xl">
                  3
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Start Using</h4>
                <p className="text-gray-600 leading-relaxed">
                  Access all services - GetCash, businesses, jobs, events, and marketplace
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <AfricanPattern className="text-white opacity-20" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of Africans already using CashLink for their daily needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button 
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Join Now - It's Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}