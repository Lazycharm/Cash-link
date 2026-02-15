import React, { useState, useEffect } from "react";
import { Notification } from "@/entities/Notification";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  TrendingUp,
  Loader2,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: AlertCircle,
    transaction: TrendingUp
  };

  const colors = {
    info: "text-blue-600 bg-blue-100",
    success: "text-green-600 bg-green-100", 
    warning: "text-yellow-600 bg-yellow-100",
    error: "text-red-600 bg-red-100",
    transaction: "text-purple-600 bg-purple-100"
  };

  const Icon = icons[notification.type] || Info;
  const colorClass = colors[notification.type] || "text-gray-600 bg-gray-100";

  return (
    <Card className={`transition-all duration-200 ${notification.is_read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-blue-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {notification.type}
                </Badge>
                {!notification.is_read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Mark as read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(notification.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userNotifications = await Notification.filter(
        { user_id: currentUser.id },
        '-created_date'
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
    setIsLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await Notification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => Notification.update(n.id, { is_read: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-10 h-10 text-blue-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 mt-2">Stay updated with your CashLink activities</p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline">
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              <p className="text-sm text-gray-600">Unread</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
              <p className="text-sm text-gray-600">Read</p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div>
          {notifications.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-600">You'll see notifications here when you have updates</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}