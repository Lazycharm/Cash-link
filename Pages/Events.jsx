
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Plus,
  Star
} from "lucide-react";
import { format, isPast, isToday, formatDistanceStrict } from "date-fns";

const EventCard = ({ event, user }) => {
  const categoryColors = {
    cultural: "bg-purple-100 text-purple-700",
    business: "bg-blue-100 text-blue-700",
    social: "bg-pink-100 text-pink-700",
    religious: "bg-green-100 text-green-700",
    educational: "bg-indigo-100 text-indigo-700",
    entertainment: "bg-amber-100 text-amber-700",
    sports: "bg-red-100 text-red-700",
    other: "bg-gray-100 text-gray-700"
  };

  // Safe date parsing with validation
  const parseEventDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const startDate = parseEventDate(event.start_datetime);
  const endDate = parseEventDate(event.end_datetime);
  const now = new Date();

  // Only calculate status if we have valid dates
  let isEventPast = false;
  let isEventUpcoming = false;
  let isEventOngoing = false;

  if (startDate && endDate) {
    isEventPast = endDate < now;
    isEventUpcoming = startDate > now;
    isEventOngoing = !isEventPast && !isEventUpcoming;
  }

  const renderEventStatus = () => {
    if (!startDate || !endDate) return <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Invalid Date</Badge>;
    if (isEventPast) return <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Past Event</Badge>;
    if (isEventOngoing) return <Badge className="bg-green-100 text-green-700">Ongoing</Badge>;
    if (isEventUpcoming) return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>;
    return null;
  };
  
  const formatTimeRange = () => {
    if (!startDate || !endDate) return "Invalid Date";
    
    try {
      const startTime = format(startDate, 'p');
      const endTime = format(endDate, 'p');
      
      // If start and end are on different days
      if (startDate.toDateString() !== endDate.toDateString()) {
          return `${format(startDate, 'MMM d, p')} - ${format(endDate, 'MMM d, p')}`;
      }
      
      return `${startTime} - ${endTime}`;
    } catch (error) {
      console.error("Error formatting time range:", error);
      return "Invalid Time";
    }
  };

  // Capitalize first letter of category
  const formatCategory = (category) => {
    if (!category) return 'Other';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPriceDisplay = () => {
    if (event.is_free) {
        return <Badge className="bg-green-100 text-green-700">FREE</Badge>;
    }
    if (event.ticket_options && event.ticket_options.length > 0) {
        const prices = event.ticket_options.map(opt => opt.price).filter(p => typeof p === 'number');
        if (prices.length === 0) return <Badge className="bg-green-100 text-green-700">FREE</Badge>;
        
        const minPrice = Math.min(...prices);
        
        return (
            <div className="text-right">
                <div className="text-sm text-gray-500">From</div>
                <div className="font-semibold text-green-600">AED {minPrice}</div>
            </div>
        );
    }
    return <Badge variant="outline">Pricing TBD</Badge>;
  };

  const canEdit = user?.id === event.organizer_id;

  return (
    <Link to={createPageUrl(`EventDetail?id=${event.id}`)} className="block">
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden flex flex-col cursor-pointer h-full">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full transform translate-x-8 -translate-y-8 opacity-20"></div>

        {event.images && event.images[0] && (
          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {event.is_featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {renderEventStatus()}
              </div>
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {event.title}
              </CardTitle>
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {startDate ? format(startDate, 'PPP') : 'Invalid Date'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatTimeRange()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {event.location?.venue_name || event.location?.address || `${event.location?.city}, ${event.location?.emirate}`}
                  </span>
                </div>
              </div>
            </div>
            {getPriceDisplay()}
          </div>
        </CardHeader>

        <CardContent className="relative flex-grow">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>

            <div className="flex flex-wrap gap-2">
              <Badge className={`${categoryColors[event.category] || categoryColors.other} capitalize`}>
                {formatCategory(event.category)}
              </Badge>
            </div>

            {event.max_attendees && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {event.current_attendees || 0}/{event.max_attendees} attendees
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${((event.current_attendees || 0) / event.max_attendees) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardContent>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {isEventUpcoming ? 'Upcoming' : isEventPast ? 'Past Event' : isEventOngoing ? 'Ongoing' : 'Unknown'}
                </span>
              </div>
              <div className="flex gap-2">
                  {canEdit && (
                      <Link to={createPageUrl(`EditEvent?id=${event.id}`)} onClick={(e) => e.stopPropagation()}>
                          <Button
                              size="sm"
                              variant="outline"
                          >
                              Edit
                          </Button>
                      </Link>
                  )}
                {event.contact?.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      window.open(`tel:${event.contact.phone}`, '_self');
                    }}
                    className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                  >
                    Call
                  </Button>
                )}
                {(event.contact?.whatsapp || event.contact?.email) && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (event.contact.whatsapp) {
                        window.open(`https://wa.me/${event.contact.whatsapp.replace('+', '')}?text=Hello, I'm interested in the ${event.title} event I found on CashLink Africa`, '_blank');
                      } else if (event.contact.email) {
                        window.open(`mailto:${event.contact.email}?subject=Interest in ${event.title} event`, '_self');
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isEventPast}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {isEventPast ? 'Past Event' : 'Join Event'}
                  </Button>
                )}
              </div>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function Events() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const currentUser = await User.me().catch(() => null); // Handle not being logged in
      setUser(currentUser);

      // Load approved events
      const allEvents = await Event.filter({ status: 'approved' });
      setEvents(allEvents);
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    }
    setIsLoading(false);
  }, []);

  const filterEvents = useCallback(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(event => event.location?.emirate === locationFilter);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      if (timeFilter === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.start_datetime) > now);
      } else if (timeFilter === 'past') {
        filtered = filtered.filter(event => new Date(event.end_datetime) < now);
      } else if (timeFilter === 'today') {
        filtered = filtered.filter(event => isToday(new Date(event.start_datetime)));
      }
    }

    // Sort featured events first, then by date
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(a.start_datetime) - new Date(b.start_datetime);
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, categoryFilter, locationFilter, timeFilter]);


  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);


  const categories = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'business', label: 'Business' },
    { value: 'social', label: 'Social' },
    { value: 'religious', label: 'Religious' },
    { value: 'educational', label: 'Educational' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  const emirates = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

  const upcomingEvents = events.filter(e => new Date(e.start_datetime) > new Date()).length;
  const todayEvents = events.filter(e => isToday(new Date(e.start_datetime))).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading events...</p>
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
                <Calendar className="w-10 h-10 text-indigo-600" />
                Community Events
              </h1>
              <p className="text-gray-600 mt-2">Join cultural, business, and social events in your area</p>
            </div>
            {user && (
              <Link to={createPageUrl("AddEvent")}>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-indigo-600">{events.length}</p>
              <p className="text-sm text-gray-600">Total Events</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{upcomingEvents}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-600">{todayEvents}</p>
              <p className="text-sm text-gray-600">Today</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">{events.filter(e => e.is_free).length}</p>
              <p className="text-sm text-gray-600">Free Events</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="When" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {emirates.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {timeFilter === 'upcoming' ? 'Upcoming Events' :
               timeFilter === 'past' ? 'Past Events' :
               timeFilter === 'today' ? 'Today\'s Events' :
               'All Events'}
            </h2>
            <Badge variant="outline" className="px-3 py-1">
              {filteredEvents.length} events found
            </Badge>
          </div>

          {filteredEvents.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  user={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
