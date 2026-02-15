
import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/User";
import { AppSettings } from "@/entities/AppSettings";
import { Transaction } from "@/entities/Transaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  MapPin,
  Phone,
  Clock,
  Search,
  Filter,
  Star,
  ArrowUpRight,
  Wallet,
  Loader2,
  ShieldCheck, // New Icon
  AlertCircle // New Icon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const getServiceDisplayName = (serviceKey) => {
    const names = {
        mtn_money: "MTN Money",
        airtel_money: "Airtel Money",
        mpesa: "M-Pesa",
        bank_transfer: "Bank Transfer",
        orange_money: "Orange Money",
        vodafone_cash: "Vodafone Cash",
        ecocash: "EcoCash",
        wave: "Wave",
        chipper_cash: "Chipper Cash",
        opay: "Opay",
        fawry_meeza: "Fawry + Meeza"
    };
    // Return predefined name if exists, otherwise format the key
    return names[serviceKey] || (serviceKey || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const AgentCard = ({ agent, onContact }) => {
    const activeServices = agent.agent_profile?.services
      ? Object.entries(agent.agent_profile.services).filter(([, enabled]) => enabled)
      : [];

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">{agent.full_name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{agent.location?.city}, {agent.location?.emirate}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">4.8</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {activeServices.slice(0, 3).map(([service]) => (
                <Badge key={service} className="bg-gray-100 text-gray-700 font-normal">
                  {getServiceDisplayName(service)}
                </Badge>
              ))}
              {activeServices.length > 3 && (
                <Badge variant="outline">+{activeServices.length - 3} more</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Available: 9:00 AM - 8:00 PM</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Commission: 2-3%</span>
              </div>
              <Button
                size="sm"
                onClick={() => onContact(agent)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
};

export default function GetCash() {
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null); // State for location errors
  const mapRef = useRef(null);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const settingsList = await AppSettings.list();
      const settings = settingsList.length > 0 ? settingsList[0] : null;

      let agentFilter = {
        app_role: 'agent',
        kyc_status: 'approved',
      };

      // If subscriptions are enabled in settings, only fetch agents with an active subscription
      if (settings?.subscriptions_enabled) {
        agentFilter.subscription_status = 'active';
      }

      const approvedAgents = await User.filter(agentFilter);
      setAgents(approvedAgents || []);
    } catch (error) {
      console.error("Error loading agents:", error);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();

    // Geolocation part
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null); // Clear previous errors
        },
        (error) => {
          console.error(`Error getting user location: ${error.message} (Code: ${error.code})`);
          if (error.code === 1) { // User denied permission
            setLocationError("You have disabled location access.");
          } else {
            setLocationError("Could not determine your location at this time.");
          }
        },
        // More lenient options to prevent timeouts
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 300000 // Allow caching location for 5 minutes
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    const loadUserDataAndTransactions = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        try {
          const userTransactions = await Transaction.filter({ customer_id: currentUser.id });
          setTransactions(userTransactions || []);
        } catch (error) {
          console.log("No transactions found for user:", error);
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserDataAndTransactions();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchQuery, locationFilter]);

  const filterAgents = () => {
    let filtered = agents;

    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location?.emirate?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(agent =>
        agent.location?.emirate === locationFilter
      );
    }

    setFilteredAgents(filtered);
  };

  const handleContactAgent = (agent) => {
    if (agent.phone_number) {
      window.open(`https://wa.me/${agent.phone_number.replace('+', '')}?text=Hello, I found you on CashLink and would like to use GetCash services`, '_blank');
    }
  };

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaima", "Fujairah", "Umm Al Quwain"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading GetCash agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="w-10 h-10 text-green-600" />
                GetCash Services
              </h1>
              <p className="text-gray-600 mt-2">Find trusted money agents for withdrawal and deposit services</p>
            </div>
            <div className="text-center md:text-right opacity-50">
              <p className="text-sm text-gray-500">Your Balance</p>
              <p className="text-2xl font-bold text-gray-400">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Services Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <CardContent className="p-6 relative">
              <DollarSign className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Money Withdrawal</h3>
              <p className="text-green-100">Get cash from your mobile money accounts through verified money agents</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <CardContent className="p-6 relative">
              <ArrowUpRight className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Money Deposit</h3>
              <p className="text-blue-100">Add money to your mobile money accounts through trusted money agents</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
            <CardContent className="p-6 relative">
              <Phone className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Instant Contact</h3>
              <p className="text-purple-100">Direct WhatsApp contact with money agents for quick transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by Emirate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emirates</SelectItem>
                  {emirates.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Location Error Message */}
        {locationError && (
            <Card className="border-0 bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-yellow-900">Location Access Disabled</h3>
                            <p className="text-yellow-800 text-sm">
                                {locationError} Features like sorting agents by distance are unavailable. You can re-enable location access in your browser's site settings.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Money Agents List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Money Agents</h2>
            <Badge variant="outline" className="px-3 py-1">
              {filteredAgents.length} money agents found
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onContact={handleContactAgent}
              />
            ))}
          </div>
        </div>
        
        {filteredAgents.length === 0 && (
            <Card className="border-0 bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="w-10 h-10 text-blue-600 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-lg text-blue-900 mb-2">Looking for Agents?</h3>
                            <p className="text-blue-800 text-sm leading-relaxed mb-2">
                                No agents are currently available in this area or matching your search criteria.
                            </p>
                            <p className="text-blue-800 text-sm leading-relaxed">
                                <strong>For your security:</strong> Only agents who have passed KYC verification and have an active subscription will appear here. If you are a new agent, please ensure an administrator has approved your account.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}AED {transaction.amount}
                      </p>
                      <Badge className={`text-xs ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Note about money agents */}
        <Card className="border-0 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">About Our Money Agents</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  All money agents shown are KYC verified and approved by our admin team. Contact them directly via WhatsApp to arrange your cash transactions safely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
