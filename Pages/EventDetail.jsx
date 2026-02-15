
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  Edit,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function EventDetail() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadEventAndUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const [events, currentUser] = await Promise.all([
        Event.list(),
        User.me().catch(() => null)
      ]);
      const foundEvent = events.find(e => e.id === eventId);
      setEvent(foundEvent);
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading event:", error);
    }
    setIsLoading(false);
  }, [eventId]); // eventId is a dependency because it's used inside loadEventAndUser

  useEffect(() => {
    if (eventId) {
      loadEventAndUser();
    }
  }, [eventId, loadEventAndUser]); // loadEventAndUser is now a stable function reference due to useCallback

  const nextImage = () => {
    if (event?.images && event.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event?.images && event.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  // Safe date parsing with validation
  const parseEventDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatTimeRange = (startDate, endDate) => {
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

  const formatCategory = (category) => {
    if (!category) return 'Other';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link to={createPageUrl("Events")}>
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const startDate = parseEventDate(event.start_datetime);
  const endDate = parseEventDate(event.end_datetime);
  const now = new Date();

  let isEventPast = false;
  let isEventUpcoming = false;
  let isEventOngoing = false;

  if (startDate && endDate) {
    isEventPast = endDate < now;
    isEventUpcoming = startDate > now;
    isEventOngoing = !isEventPast && !isEventUpcoming;
  }

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

  const canEdit = user && (user.id === event.organizer_id || user.role === 'admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Events")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
          {canEdit && (
            <Link to={createPageUrl(`EditEvent?id=${event.id}`)}>
              <Button variant="outline" className="ml-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
            </Link>
          )}
        </div>

        {/* Images */}
        {event.images && event.images.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0 relative">
              <img
                src={event.images[currentImageIndex]}
                alt={event.title}
                className="w-full h-96 object-cover transition-opacity duration-300"
                key={currentImageIndex}
              />
              {event.is_featured && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}

              {event.images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info (left column) */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900">{event.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={`${categoryColors[event.category] || categoryColors.other} capitalize`}>
                    {formatCategory(event.category)}
                  </Badge>
                  {isEventPast ? <Badge variant="outline" className="text-gray-500 border-gray-300">Past Event</Badge> :
                   isEventOngoing ? <Badge className="bg-green-100 text-green-700">Ongoing</Badge> :
                   isEventUpcoming ? <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge> : null
                  }
                  {event.is_free && (
                    <Badge className="bg-green-100 text-green-700">FREE</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              </CardContent>
            </Card>

            {!event.is_free && event.ticket_options && event.ticket_options.length > 0 && (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {event.ticket_options.map((opt, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{opt.name}</TableCell>
                                        <TableCell>{opt.description}</TableCell>
                                        <TableCell className="text-right font-bold">AED {opt.price}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

          </div>

          {/* Event Info & Contact (right column) */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date, Time, Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {startDate ? format(startDate, 'PPP') : 'Invalid Date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{formatTimeRange(startDate, endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {event.location?.venue_name && `${event.location.venue_name}, `}
                      {event.location?.address || `${event.location?.city}, ${event.location?.emirate}`}
                    </span>
                  </div>
                </div>

                {/* Attendance */}
                {event.max_attendees && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Attendance</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{event.current_attendees || 0}/{event.max_attendees} attendees</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${((event.current_attendees || 0) / event.max_attendees) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <hr className="my-4 border-gray-200" />

                {/* Contact Organizer */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">Contact Organizer</h3>

                  <div className="space-y-3">
                    {event.contact?.phone && (
                      <Button
                        variant="outline"
                        className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => window.open(`tel:${event.contact.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Organizer
                      </Button>
                    )}

                    {(event.contact?.whatsapp || event.contact?.email) && (
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => {
                          if (event.contact.whatsapp) {
                            window.open(`https://wa.me/${event.contact.whatsapp.replace('+', '')}?text=Hello, I'm interested in the ${event.title} event I found on CashLink Africa`, '_blank');
                          } else if (event.contact.email) {
                            window.open(`mailto:${event.contact.email}?subject=Interest in ${event.title} event`, '_self');
                          }
                        }}
                        disabled={isEventPast}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {isEventPast ? 'Event Ended' : 'Join Event'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
