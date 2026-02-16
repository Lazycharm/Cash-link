import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Car,
  Briefcase,
  Calendar,
  ShoppingBag,
  HelpCircle,
  Phone,
  Heart,
  Search,
  Wrench,
  Zap,
  Award,
  Clock,
  Building2
} from "lucide-react";

const ServiceCard = ({ icon: Icon, title, description, color, gradient, delay = 0, badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
  >
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-2 h-full">
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg relative`}>
          <Icon className="w-8 h-8 text-white" />
          {badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (!amount || !fromCurrency) {
      setError("Please enter an amount and select a currency");
      return;
    }
    
    if (parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const result = await convertCurrency(parseFloat(amount), fromCurrency);
      
      setResults({
        aed_amount: result.aed_amount,
        usd_amount: result.usd_amount,
        aed_rate: result.aed_rate,
        usd_rate: result.usd_rate
      });
    } catch (error) {
      console.error("Currency conversion failed:", error);
      setError("Failed to convert currency. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && amount && fromCurrency) {
      handleConvert();
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm">
      <CardContent className="p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-3 shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Currency Converter</h3>
          <p className="text-gray-600 text-sm">Real-time exchange rates</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleKeyPress}
              className="rounded-xl h-11"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
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
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-11 font-semibold shadow-lg"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Convert"
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-xs text-center">{error}</p>
          </div>
        )}
        
        {results && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">🇦🇪</div>
                <div className="text-xl font-bold text-blue-700">
                  {results.aed_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-blue-600">AED</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">🇺🇸</div>
                <div className="text-xl font-bold text-green-700">
                  {results.usd_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-green-600">USD</div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Welcome() {
  const services = [
    {
      icon: DollarSign,
      title: "GetCash",
      description: "Find verified money transfer agents near you. Send and receive money safely.",
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
      path: "/get-cash",
      badge: "Popular"
    },
    {
      icon: Car,
      title: "GetRide",
      description: "Book reliable transportation with verified drivers across the UAE.",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
      path: "/get-ride"
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Buy and sell items within the community. Safe transactions guaranteed.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      path: "/marketplace"
    },
    {
      icon: Briefcase,
      title: "Jobs",
      description: "Discover job opportunities posted by verified employers in the UAE.",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
      path: "/jobs"
    },
    {
      icon: Building2,
      title: "Publish Business",
      description: "List your African business and reach thousands of potential customers.",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      path: "/add-business"
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Join community events, gatherings, and cultural celebrations.",
      gradient: "bg-gradient-to-br from-rose-500 to-red-500",
      path: "/events"
    },
    {
      icon: HelpCircle,
      title: "UAE Help Center",
      description: "Resources, guides, and support for newcomers to the UAE.",
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-500",
      path: "/uae-help"
    },
    {
      icon: Store,
      title: "Business Directory",
      description: "Explore authentic African restaurants, shops, and services.",
      gradient: "bg-gradient-to-br from-yellow-500 to-amber-500",
      path: "/businesses"
    }
  ];

  const communityFeatures = [
    {
      icon: Heart,
      title: "Donations",
      description: "Support community members in need",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-600"
    },
    {
      icon: Search,
      title: "Lost & Found",
      description: "Report and find lost items",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600"
    },
    {
      icon: Phone,
      title: "Emergency Services",
      description: "Quick access to emergency contacts",
      gradient: "bg-gradient-to-br from-red-500 to-red-600"
    },
    {
      icon: Wrench,
      title: "Utility Tools",
      description: "Currency converter, reminders & more",
      gradient: "bg-gradient-to-br from-slate-500 to-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="CashLink Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-bold text-gray-900 text-lg sm:text-xl">CashLink</h1>
              <p className="text-green-600 text-xs font-medium">Your African Community in UAE</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-green-600">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Trusted by 10,000+ Africans in UAE
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Everything You Need
              <span className="block bg-gradient-to-r from-green-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent mt-2">
                In One Platform
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Money transfers, jobs, businesses, events, marketplace, and more. All for the African community in the UAE.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 bg-white"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16"
          >
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">500+</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Agents</p>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">200+</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Businesses</p>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">10k+</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Users</p>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">100+</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Jobs</p>
            </div>
          </motion.div>
        </div>

        {/* Currency Converter - Compact */}
        <div className="mb-16 md:mb-20 max-w-2xl mx-auto px-4">
          <CurrencyConverter />
        </div>

        {/* Main Services Grid */}
        <div className="mb-16 md:mb-20 px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Your Services in One Place</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to thrive in the UAE - from money transfers to finding jobs and connecting with your community
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <Link key={index} to={service.path}>
                <ServiceCard {...service} delay={index} />
              </Link>
            ))}
          </div>
        </div>

        {/* Community Features */}
        <div className="mb-16 md:mb-20 px-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 max-w-6xl mx-auto shadow-2xl">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Community Features</h3>
              <p className="text-gray-600 text-lg">Connect, support, and help each other</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {communityFeatures.map((feature, index) => (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">{feature.title}</h4>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose CashLink */}
        <div className="mb-16 md:mb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose CashLink?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl">Verified & Secure</h4>
                  <p className="text-gray-600">
                    All agents and businesses are KYC verified. Your safety is our priority.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl">Fast & Easy</h4>
                  <p className="text-gray-600">
                    Find what you need in seconds. Simple interface, powerful features.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl">Community First</h4>
                  <p className="text-gray-600">
                    Built by Africans, for Africans. Connect with your community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16 md:mb-20 px-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 max-w-6xl mx-auto shadow-2xl">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
              <p className="text-gray-600 text-lg">Get started in three simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-xl">
                  1
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-xl">Sign Up Free</h4>
                <p className="text-gray-600 leading-relaxed">
                  Create your account in seconds with Google or email. No credit card required.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-xl">
                  2
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-xl">Complete Profile</h4>
                <p className="text-gray-600 leading-relaxed">
                  Add your details and location. Get verified to unlock all features.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-xl">
                  3
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-xl">Start Using</h4>
                <p className="text-gray-600 leading-relaxed">
                  Access all services - GetCash, jobs, businesses, events, and more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mb-16 px-4">
          <div className="text-center bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20H0v-2h20zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h14v2H20v-2zm0-4h14v2H20v-2zm0 8h14v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-xl md:text-2xl mb-8 text-green-50">
                Join 10,000+ Africans already using CashLink
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link to="/signup">
                  <Button 
                    className="bg-white text-green-600 hover:bg-gray-100 px-10 py-6 rounded-2xl text-lg md:text-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-green-100 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
