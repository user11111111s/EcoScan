import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import BarcodeScanner from "./barcode-scanner";
import { useScanner } from "@/hooks/use-scanner";
import { useToast } from "@/hooks/use-toast";
import { getRecentSearches } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

interface ScanSectionProps {
  initialSearches?: string[];
}

export default function ScanSection({ initialSearches = [] }: ScanSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { scanBarcode, searchProduct, isLoading } = useScanner();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Fetch recent searches if user is authenticated
  const { data: searchHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/search-history'],
    queryFn: () => getRecentSearches(5),
    enabled: !!user // Only run if user is authenticated
  });
  
  // Extract search queries from search history
  const recentSearches = searchHistory 
    ? searchHistory.map(item => item.query)
    : initialSearches;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    try {
      const products = await searchProduct(searchQuery);
      
      if (products.length === 1) {
        // If only one product found, navigate directly to it
        setLocation(`/product/${products[0].id}`);
      } else if (products.length > 1) {
        // TODO: Show search results view
        toast({
          title: "Multiple products found",
          description: `Found ${products.length} products matching "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      const product = await scanBarcode(barcode);
      
      if (product) {
        setIsScannerOpen(false);
        setLocation(`/product/${product.id}`);
      }
    } catch (error) {
      console.error("Barcode detection error:", error);
    }
  };

  return (
    <div className="py-8">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-3">Scan or search for a product</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Discover the sustainability rating and find eco-friendly alternatives
        </p>
        
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex relative">
            <Input
              type="text"
              placeholder="Search by product name or barcode..."
              className="w-full px-4 py-3 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              disabled={isLoading}
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
        
        <div className="mb-8">
          {isScannerOpen ? (
            <BarcodeScanner
              onDetected={handleBarcodeDetected}
              onClose={() => setIsScannerOpen(false)}
              className="h-72 rounded-xl"
            />
          ) : (
            <div 
              className="bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 relative overflow-hidden cursor-pointer"
            >
              <div className="mb-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">Use your device's camera to scan a product barcode</p>
              <div className="text-center">
                <Button 
                  className="bg-primary-500 hover:bg-primary-600 text-white" 
                  onClick={() => setIsScannerOpen(true)}
                >
                  Open Camera
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {recentSearches.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Recently scanned:</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {recentSearches.map((search, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
