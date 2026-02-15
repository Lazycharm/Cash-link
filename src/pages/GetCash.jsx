
import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/User";
import { AppSettings } from "@/entities/AppSettings";
import { Transaction } from "@/entities/Transaction";
import { Review } from "@/entities/Review";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DollarSign,
  MapPin,
  Phone,
  Clock,
  Search,
  Filter,
  Star,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Globe,
  Send,
  CheckCircle,
  X,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReviewDialog from "@/components/ReviewDialog";
import NearbyMap from "@/components/map/NearbyMap";
import { findNearbyAgents } from "@/utils/nearbySearch";
import { getCurrentLocation } from "@/utils/location";

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

const AgentCard = ({ agent, onRequestTransaction }) => {
    const activeServices = agent.agent_settings?.services
      ? Object.entries(agent.agent_settings.services).filter(([, enabled]) => enabled)
      : [];
    
    const rates = agent.agent_settings?.rates || {};
    const isOnline = agent.agent_settings?.isAvailable !== false;
    const supportedNetworks = agent.supported_networks || [];
    const amountLimits = agent.amount_limits || { min: 10, max: 50000 };

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>
        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-gray-900">
                  {agent.business_name || agent.full_name}
                </CardTitle>
                {isOnline && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{agent.location?.city}, {agent.location?.emirate}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">{agent.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-xs text-gray-400">({agent.reviews_count || 0})</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="space-y-3">
            {/* Services */}
            <div className="space-y-2">
              {activeServices.map(([service]) => {
                const icons = {
                  cashToMobile: <ArrowUpRight className="w-3 h-3 text-green-600" />,
                  mobileToCash: <ArrowDownLeft className="w-3 h-3 text-blue-600" />,
                  internationalTransfer: <Globe className="w-3 h-3 text-purple-600" />
                };
                const labels = {
                  cashToMobile: 'Cash → Mobile',
                  mobileToCash: 'Mobile → Cash',
                  internationalTransfer: 'International'
                };
                return (
                  <div key={service} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {icons[service]}
                      {labels[service] || service}
                    </span>
                    <span className="text-gray-500">{rates[service] || '2'}% fee</span>
                  </div>
                );
              })}
              {activeServices.length === 0 && (
                <p className="text-sm text-gray-400">No services listed</p>
              )}
            </div>

            {/* Supported Networks */}
            {supportedNetworks.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {supportedNetworks.slice(0, 4).map(network => (
                  <Badge key={network} variant="outline" className="text-xs">
                    {getServiceDisplayName(network)}
                  </Badge>
                ))}
                {supportedNetworks.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{supportedNetworks.length - 4} more</Badge>
                )}
              </div>
            )}

            {/* Amount limits */}
            <div className="text-xs text-gray-500 pt-2">
              Accepts: AED {amountLimits.min} - AED {amountLimits.max?.toLocaleString()}
            </div>

            <div className="pt-3 border-t">
              <Button
                size="sm"
                onClick={() => onRequestTransaction(agent)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Request Transaction
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
  const [nearbyAgents, setNearbyAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  
  // Transaction request state
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestData, setRequestData] = useState({
    serviceType: 'cash_to_mobile',
    amount: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Review state
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewTransaction, setReviewTransaction] = useState(null);

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

  // Load nearby agents when user location is available
  const loadNearbyAgents = async () => {
    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return;
    }

    setIsLoadingNearby(true);
    try {
      const nearby = await findNearbyAgents(userLocation.lat, userLocation.lng, 5);
      setNearbyAgents(nearby);
    } catch (error) {
      console.error("Error loading nearby agents:", error);
      setNearbyAgents([]);
    } finally {
      setIsLoadingNearby(false);
    }
  };

  useEffect(() => {
    loadAgents();

    // Get user location
    getCurrentLocation()
      .then((location) => {
        setUserLocation(location);
        setLocationError(null);
      })
      .catch((error) => {
        console.error("Error getting user location:", error);
        setLocationError(error.message);
      });
  }, []);

  // Load nearby agents when location is available
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      loadNearbyAgents();
      
      // Refresh nearby agents every 25 seconds
      const interval = setInterval(() => {
        loadNearbyAgents();
      }, 25000);
      
      return () => clearInterval(interval);
    }
  }, [userLocation]);

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
    if (agent.phone || agent.phone_number) {
      const phone = (agent.phone || agent.phone_number).replace('+', '');
      window.open(`https://wa.me/${phone}?text=Hello, I found you on CashLink and would like to use GetCash services`, '_blank');
    }
  };

  const handleRequestTransaction = (agent) => {
    if (!user) {
      alert('Please log in to request a transaction');
      return;
    }
    setSelectedAgent(agent);
    setRequestData({ 
      serviceType: 'cash_to_mobile', 
      amount: '', 
      notes: '',
      network: agent.supported_networks?.[0] || ''
    });
    setSubmitSuccess(false);
    setShowRequestDialog(true);
  };

  const calculateFee = () => {
    if (!selectedAgent || !requestData.amount) return 0;
    const amount = parseFloat(requestData.amount) || 0;
    
    // Check for network-specific fee first
    const networkFees = selectedAgent.agent_settings?.networkFees || {};
    const networkFee = networkFees[requestData.network];
    
    // Fall back to service type fee
    const rates = selectedAgent.agent_settings?.rates || {};
    const serviceRateKey = requestData.serviceType === 'cash_to_mobile' ? 'cashToMobile' : 
                          requestData.serviceType === 'mobile_to_cash' ? 'mobileToCash' : 'internationalTransfer';
    
    let percentage = 2; // default
    let minFee = 0;
    
    if (networkFee) {
      percentage = parseFloat(networkFee.percentage) || 2;
      minFee = parseFloat(networkFee.minFee) || 0;
    } else if (rates[serviceRateKey]) {
      percentage = parseFloat(rates[serviceRateKey]) || 2;
    }
    
    let fee = (amount * percentage) / 100;
    if (minFee && fee < minFee) {
      fee = minFee;
    }
    
    return { fee: Math.round(fee * 100) / 100, percentage };
  };

  const handleSubmitRequest = async () => {
    if (!requestData.amount || parseFloat(requestData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(requestData.amount);
    const limits = selectedAgent.amount_limits || { min: 10, max: 50000 };
    
    if (amount < limits.min) {
      alert(`Minimum amount is AED ${limits.min}`);
      return;
    }
    if (amount > limits.max) {
      alert(`Maximum amount is AED ${limits.max.toLocaleString()}`);
      return;
    }

    const feeInfo = calculateFee();

    setIsSubmitting(true);
    try {
      await Transaction.create({
        type: requestData.serviceType === 'cash_to_mobile' ? 'deposit' : 'withdrawal',
        service_type: requestData.serviceType,
        customer_id: user.id,
        agent_id: selectedAgent.id,
        amount: amount,
        fee_amount: feeInfo.fee,
        fee_percentage: feeInfo.percentage,
        network: requestData.network,
        currency: 'AED',
        status: 'pending',
        customer_confirmed: false,
        agent_confirmed: false,
        notes: requestData.notes,
        location: user.location || null
      });

      setSubmitSuccess(true);
      
      // Refresh transactions
      const userTransactions = await Transaction.filter({ customer_id: user.id });
      setTransactions(userTransactions || []);

      // Keep dialog open to show success and WhatsApp option
      setTimeout(() => {
        setShowRequestDialog(false);
        setSelectedAgent(null);
      }, 5000);

    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to submit request: ' + (error.message || 'Please try again.'));
    }
    setIsSubmitting(false);
  };

  const handleCustomerConfirm = async (transactionId) => {
    try {
      const updatedTransaction = await Transaction.customerConfirm(transactionId);
      
      // Refresh transactions from database to get accurate state
      const userTransactions = await Transaction.filter({ customer_id: user.id });
      setTransactions(userTransactions || []);
      
      if (updatedTransaction.status === 'completed') {
        alert('Transaction completed successfully!');
      } else {
        alert('Your confirmation has been recorded. Waiting for agent to confirm.');
      }
    } catch (error) {
      console.error('Failed to confirm transaction:', error);
      alert('Failed to confirm: ' + (error.message || 'Unknown error'));
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Fixed Header for Mobile */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm md:hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">GetCash</h1>
            </div>
            <div className="text-right opacity-50">
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-lg font-bold text-gray-400">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:block text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" />
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

        {/* Services Info - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
            <CardContent className="p-4 md:p-6 relative">
              <DollarSign className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Withdrawal</h3>
              <p className="text-green-100 text-xs md:text-sm hidden sm:block">Get cash from your mobile money accounts</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-4 md:p-6 relative">
              <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Deposit</h3>
              <p className="text-blue-100 text-xs md:text-sm hidden sm:block">Add money to your mobile wallet</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-4 md:p-6 relative">
              <Phone className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Contact</h3>
              <p className="text-purple-100 text-xs md:text-sm hidden sm:block">Direct WhatsApp with agents</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Mobile Optimized */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10 rounded-xl text-sm md:text-base h-10 md:h-11"
                />
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-40 md:w-48 rounded-xl h-10 md:h-11 text-sm md:text-base">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Emirate" />
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
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-start gap-2 md:gap-3">
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mt-0.5 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-sm md:text-base text-yellow-900">Location Disabled</h3>
                            <p className="text-yellow-800 text-xs md:text-sm">
                                {locationError}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Nearby Map Section */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Nearby Agents on Map
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
            </CardHeader>
            {showMap && (
              <CardContent>
                {isLoadingNearby ? (
                  <div className="h-96 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  </div>
                ) : nearbyAgents.length > 0 ? (
                  <div className="space-y-4">
                    <NearbyMap
                      markers={nearbyAgents.map(agent => ({
                        id: agent.id,
                        lat: agent.latitude,
                        lng: agent.longitude,
                        name: agent.business_name || agent.full_name,
                        distance: agent.distance,
                        phone: agent.phone || agent.phone_number,
                        type: 'agent',
                        isOnline: agent.is_online,
                      }))}
                      userLocation={userLocation}
                      markerType="agent"
                      height={400}
                      onMarkerClick={(marker) => {
                        const agent = agents.find(a => a.id === marker.id);
                        if (agent) {
                          handleRequestTransaction(agent);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Showing {nearbyAgents.length} agent{nearbyAgents.length !== 1 ? 's' : ''} within 5km. Map updates every 25 seconds.
                    </p>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No nearby agents found</p>
                      <p className="text-xs text-gray-400 mt-1">Try expanding your search or check back later</p>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Money Agents List */}
        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Available Agents</h2>
            <Badge variant="outline" className="px-2 md:px-3 py-1 text-xs md:text-sm">
              {filteredAgents.length} found
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onRequestTransaction={handleRequestTransaction}
              />
            ))}
          </div>
        </div>
        
        {filteredAgents.length === 0 && (
            <Card className="border-0 bg-blue-50 border-blue-200">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                        <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-blue-600 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-base md:text-lg text-blue-900 mb-1 md:mb-2">Looking for Agents?</h3>
                            <p className="text-blue-800 text-xs md:text-sm leading-relaxed mb-2">
                                No agents are currently available in this area or matching your search criteria.
                            </p>
                            <p className="text-blue-800 text-xs md:text-sm leading-relaxed">
                                <strong>For your security:</strong> Only verified agents with active subscriptions appear here.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                Your Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {transactions.slice(0, 10).map((transaction) => {
                  const getConfirmationStatus = () => {
                    if (transaction.status === 'completed') {
                      return { text: 'Completed', color: 'text-green-600', bg: 'bg-green-100' };
                    }
                    if (transaction.customer_confirmed && transaction.agent_confirmed) {
                      return { text: 'Both Confirmed', color: 'text-green-600', bg: 'bg-green-100' };
                    }
                    if (transaction.customer_confirmed) {
                      return { text: 'Awaiting Agent', color: 'text-blue-600', bg: 'bg-blue-100' };
                    }
                    if (transaction.agent_confirmed) {
                      return { text: 'Confirm to Complete', color: 'text-orange-600', bg: 'bg-orange-100' };
                    }
                    return { text: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' };
                  };
                  const confirmStatus = getConfirmationStatus();

                  return (
                    <div key={transaction.id} className="flex flex-col gap-3 p-3 md:p-4 bg-gray-50 rounded-xl">
                      {/* Top row - Service info and amount */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.service_type === 'mobile_to_cash' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {transaction.service_type === 'mobile_to_cash' ? 
                              <ArrowDownLeft className="w-4 h-4" /> : 
                              <ArrowUpRight className="w-4 h-4" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base text-gray-900 capitalize truncate">
                              {transaction.service_type?.replace(/_/g, ' ') || transaction.type}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 truncate">
                              {transaction.agent?.full_name && `${transaction.agent.full_name}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm md:text-base text-gray-900">
                            AED {parseFloat(transaction.amount || 0).toFixed(2)}
                          </p>
                          {transaction.fee_amount > 0 && (
                            <p className="text-xs text-gray-500">Fee: AED {parseFloat(transaction.fee_amount).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Bottom row - Status and actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                        <Badge className={`text-xs ${confirmStatus.bg} ${confirmStatus.color}`}>
                          {confirmStatus.text}
                        </Badge>
                        <span className="text-xs text-gray-400 flex-1">
                          {new Date(transaction.created_date).toLocaleDateString()}
                          {transaction.network && ` • ${getServiceDisplayName(transaction.network)}`}
                        </span>

                        {/* WhatsApp button - only after transaction is submitted */}
                        {transaction.agent?.phone && transaction.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const phone = transaction.agent.phone.replace('+', '');
                              window.open(`https://wa.me/${phone}?text=Hi, I have a pending transaction (ID: ${transaction.id.slice(0,8)}) for AED ${transaction.amount}`, '_blank');
                            }}
                            className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs px-2"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        )}

                        {/* Customer confirm button - show when agent has confirmed but customer hasn't */}
                        {transaction.status === 'pending' && transaction.agent_confirmed && !transaction.customer_confirmed && (
                          <Button
                            size="sm"
                            onClick={() => handleCustomerConfirm(transaction.id)}
                            className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs px-2"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirm
                          </Button>
                        )}

                        {/* Review button - only for completed transactions */}
                        {transaction.status === 'completed' && transaction.agent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReviewTransaction(transaction);
                              setShowReviewDialog(true);
                            }}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 text-xs px-2"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Note about money agents */}
        <Card className="border-0 bg-blue-50 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-2 md:gap-3">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mt-0.5 md:mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm md:text-base text-blue-900 mb-1 md:mb-2">About Our Money Agents</h3>
                <p className="text-blue-800 text-xs md:text-sm leading-relaxed">
                  All money agents shown are KYC verified. Contact them via WhatsApp to arrange your transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto p-4 md:p-6">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Request Sent!</h3>
              <p className="text-gray-600">
                Your transaction request for <strong>AED {requestData.amount}</strong> has been sent to {selectedAgent?.business_name || selectedAgent?.full_name}.
              </p>
              
              {/* WhatsApp button after successful submission */}
              {(selectedAgent?.phone || selectedAgent?.phone_number) && (
                <Button
                  onClick={() => {
                    const phone = (selectedAgent.phone || selectedAgent.phone_number).replace('+', '');
                    window.open(`https://wa.me/${phone}?text=Hi, I just submitted a transaction request for AED ${requestData.amount} on CashLink. Please confirm when you're ready.`, '_blank');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact on WhatsApp
                </Button>
              )}
              
              <p className="text-sm text-gray-500">
                After completing the transaction, come back here to confirm it's done.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Request Transaction</DialogTitle>
                <DialogDescription>
                  Send a transaction request to {selectedAgent?.business_name || selectedAgent?.full_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Service Type */}
                <div className="space-y-3">
                  <Label>Service Type</Label>
                  <RadioGroup
                    value={requestData.serviceType}
                    onValueChange={(value) => setRequestData({ ...requestData, serviceType: value })}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      requestData.serviceType === 'cash_to_mobile' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="cash_to_mobile" id="cash_to_mobile" />
                      <Label htmlFor="cash_to_mobile" className="flex items-center gap-2 cursor-pointer flex-1">
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium">Cash to Mobile Money</p>
                          <p className="text-xs text-gray-500">Convert your cash to mobile wallet</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      requestData.serviceType === 'mobile_to_cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="mobile_to_cash" id="mobile_to_cash" />
                      <Label htmlFor="mobile_to_cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">Mobile Money to Cash</p>
                          <p className="text-xs text-gray-500">Withdraw mobile money as cash</p>
                        </div>
                      </Label>
                    </div>

                    {selectedAgent?.agent_settings?.services?.internationalTransfer && (
                      <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        requestData.serviceType === 'international_transfer' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}>
                        <RadioGroupItem value="international_transfer" id="international_transfer" />
                        <Label htmlFor="international_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Globe className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-medium">International Transfer</p>
                            <p className="text-xs text-gray-500">Send money abroad</p>
                          </div>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>

                {/* Network Selection */}
                {selectedAgent?.supported_networks?.length > 0 && (
                  <div className="space-y-2">
                    <Label>Money Network</Label>
                    <Select 
                      value={requestData.network} 
                      onValueChange={(value) => setRequestData({ ...requestData, network: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a network" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedAgent.supported_networks.map(network => (
                          <SelectItem key={network} value={network}>
                            {getServiceDisplayName(network)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <Label>Amount (AED)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder={`Enter amount (${selectedAgent?.amount_limits?.min || 10} - ${selectedAgent?.amount_limits?.max?.toLocaleString() || '50,000'})`}
                      value={requestData.amount}
                      onChange={(e) => setRequestData({ ...requestData, amount: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Fee calculation display */}
                  {requestData.amount && parseFloat(requestData.amount) > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">AED {parseFloat(requestData.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Fee ({calculateFee().percentage}%):</span>
                        <span className="font-medium text-orange-600">AED {calculateFee().fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t pt-1">
                        <span>Total:</span>
                        <span className="text-green-600">AED {(parseFloat(requestData.amount) + calculateFee().fee).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any special instructions or details..."
                    value={requestData.notes}
                    onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Important note */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>How it works:</strong> After submitting, you'll get a WhatsApp button to contact the agent. 
                    Both you and the agent must confirm completion for the transaction to be marked as done.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting || !requestData.amount}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      {reviewTransaction && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => {
            setShowReviewDialog(false);
            setReviewTransaction(null);
          }}
          reviewedUser={reviewTransaction.agent}
          entityType="agent"
          transactionId={reviewTransaction.id}
          onReviewSubmitted={() => {
            // Refresh agents to show updated ratings
            loadAgents();
          }}
        />
      )}
    </div>
  );
}
