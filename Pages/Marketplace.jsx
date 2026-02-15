import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MarketplaceItem } from "@/entities/MarketplaceItem";
import { User } from "@/entities/User";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  MapPin, 
  Camera, 
  Heart,
  Store,
  Grid3X3,
  List,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

// --- COMPONENTS ---

const CategoryPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
      active 
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

const MarketItemCard = ({ item }) => (
  <Link to={createPageUrl(`MarketplaceItemDetail?id=${item.id}`)} className="group block">
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img 
          src={item.images?.[0] || "https://via.placeholder.com/400?text=No+Image"} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
            <Button size="icon" variant="secondary" className="rounded-full h-8 w-8 bg-white/90 hover:bg-white shadow-sm">
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
            </Button>
        </div>
        
        {item.is_promoted && (
             <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                 Promoted
             </div>
        )}
        
        <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <p className="text-xs font-medium flex items-center gap-1 truncate">
                 <MapPin className="w-3 h-3" /> {item.location?.city}
             </p>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
             <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                {item.title}
             </h3>
        </div>
        
        <div className="mt-auto pt-2">
            <p className="text-lg font-bold text-gray-900">
                AED {item.price?.toLocaleString()}
            </p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 capitalize">{item.condition.replace('_', ' ')}</span>
            </div>
        </div>
      </div>
    </div>
  </Link>
);

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const allItems = await MarketplaceItem.filter({ status: "approved" }, "-created_date", 50);
      setItems(allItems);
    } catch (error) {
      console.error("Failed to load marketplace items", error);
    }
    setLoading(false);
  };

  const categories = [
    { id: "all", label: "All Items" },
    { id: "electronics", label: "Electronics" },
    { id: "vehicles", label: "Vehicles" },
    { id: "furniture", label: "Furniture" },
    { id: "clothing", label: "Clothing" },
    { id: "books", label: "Books" },
    { id: "sports", label: "Sports" },
    { id: "home", label: "Home" },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesLocation = locationFilter === "all" || item.location?.emirate === locationFilter;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER & SEARCH */}
      <div className="bg-white border-b sticky top-16 md:top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Store className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Marketplace</h1>
          </div>

          <div className="flex-1 w-full max-w-2xl flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                    placeholder="Search for cars, phones, furniture..." 
                    className="pl-10 h-11 bg-gray-100 border-transparent focus:bg-white transition-all rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Link to={createPageUrl("SellItem")}>
                <Button className="h-11 rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 shadow-md">
                    <Camera className="w-4 h-4 mr-2" /> Sell
                </Button>
            </Link>
          </div>
          
          <Button 
            variant="ghost" 
            className="md:hidden w-full flex justify-between border"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {/* Categories Horizontal Scroll */}
        <div className="max-w-7xl mx-auto mt-4 overflow-x-auto pb-2 hide-scrollbar flex gap-2">
            {categories.map(cat => (
                <CategoryPill 
                    key={cat.id} 
                    label={cat.label} 
                    active={selectedCategory === cat.id} 
                    onClick={() => setSelectedCategory(cat.id)} 
                />
            ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 flex gap-8">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <div className={`hidden md:block w-64 flex-shrink-0 space-y-8 sticky top-32 h-fit`}>
            <div>
                <h3 className="font-bold text-lg mb-4">Filters</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All Emirates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Emirates</SelectItem>
                                <SelectItem value="Dubai">Dubai</SelectItem>
                                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                                <SelectItem value="Sharjah">Sharjah</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                         <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                            <span>Price Range</span>
                            <span className="text-emerald-600">AED {priceRange[1].toLocaleString()}</span>
                         </div>
                         <Slider 
                            defaultValue={[10000]} 
                            max={50000} 
                            step={100} 
                            onValueChange={(val) => setPriceRange([0, val[0]])}
                            className="py-4"
                         />
                         <div className="flex justify-between text-xs text-gray-400">
                            <span>AED 0</span>
                            <span>AED 50k+</span>
                         </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Condition</label>
                        <div className="space-y-2">
                            {['New', 'Used - Like New', 'Used - Good'].map(c => (
                                <div key={c} className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    <span className="text-sm text-gray-600">{c}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN GRID */}
        <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-gray-800">
                    {selectedCategory === 'all' ? 'Today\'s Picks' : categories.find(c => c.id === selectedCategory)?.label}
                </h2>
                <span className="text-sm text-gray-500">{filteredItems.length} items</span>
            </div>

            {loading ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="bg-white rounded-xl h-64 animate-pulse">
                            <div className="h-40 bg-gray-200 rounded-t-xl" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                 </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <MarketItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No items found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        We couldn't find any items matching your filters. Try adjusting your search or category.
                    </p>
                    <Button 
                        variant="outline" 
                        className="mt-6"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                            setLocationFilter("all");
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}