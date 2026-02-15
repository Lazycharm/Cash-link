
import React, { useState, useEffect } from 'react';
import { LostItem } from '@/entities/LostItem';
import { User } from '@/entities/User';
import { AppSettings } from '@/entities/AppSettings';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Phone, Loader2, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ItemCard = ({ item }) => {
  const [reporter, setReporter] = useState(null);
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (item.reporter_id) {
        try {
          const allUsers = await User.list();
          const foundUser = allUsers.find(u => u.id === item.reporter_id);
          setReporter(foundUser);
        } catch (e) {
          console.error("Failed to load reporter")
        }
      }
      try {
        const settings = await AppSettings.list();
        if (settings.length > 0) setAppSettings(settings[0]);
      } catch (e) {
        console.error("Failed to load settings");
      }
    };
    loadData();
  }, [item.reporter_id]);

  const handleContact = () => {
    const contactNumber = reporter?.phone_number || appSettings?.admin_whatsapp;
    if (contactNumber) {
      const message = `Hello, I'm contacting you about the ${item.type} item: "${item.item_name}".`;
      window.open(`https://wa.me/${contactNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      alert("Contact information not available.");
    }
  };

  return (
    <Card className="overflow-hidden">
      <img src={item.image || 'https://via.placeholder.com/400x300'} alt={item.item_name} className="w-full h-48 object-cover" />
      <CardHeader>
        <CardTitle>{item.item_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Location: {item.last_seen_location}</p>
        <p className="text-sm text-gray-500 mt-2">{item.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleContact}>
          <Phone className="w-4 h-4 mr-2" /> Contact Reporter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function LostAndFoundPage() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      // Only fetch items that have been approved by an admin
      const allItems = await LostItem.filter({ status: 'approved' });
      setLostItems(allItems.filter(i => i.type === 'lost'));
      setFoundItems(allItems.filter(i => i.type === 'found'));
    } catch (error) {
      console.error("Error fetching lost and found items:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Community")}>
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Lost & Found</h1>
          </div>
          <Link to={createPageUrl("ReportLostItem")}>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Report an Item
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <Tabs defaultValue="lost" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lost">Lost Items</TabsTrigger>
              <TabsTrigger value="found">Found Items</TabsTrigger>
            </TabsList>
            <TabsContent value="lost" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lostItems.length > 0 ? (
                  lostItems.map(item => <ItemCard key={item.id} item={item} />)
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-12">No lost items reported yet.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="found" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {foundItems.length > 0 ? (
                  foundItems.map(item => <ItemCard key={item.id} item={item} />)
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-12">No found items reported yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
