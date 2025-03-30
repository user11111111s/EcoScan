import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share, Heart, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import EcoScore from "@/components/eco-score";
import MetricBar from "@/components/metric-bar";
import ProductCard from "@/components/product-card";
import { getProductById, addFavorite, getFavorites } from "@/lib/api";
import { type Product, type Alternative } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function ProductDetails() {
  const [match, params] = useRoute<{ id: string }>("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Mock alternatives for demo
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    {
      id: 101,
      name: "Small Planet Oat Milk",
      ecoScore: "A+",
      feature: "Zero-waste packaging"
    },
    {
      id: 102,
      name: "Local Farms Oat Milk",
      ecoScore: "A",
      feature: "Local production, less transport"
    }
  ]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${params?.id}`],
    enabled: !!params?.id,
    queryFn: () => getProductById(Number(params?.id))
  });

  useEffect(() => {
    // Could check if product is in favorites
    setIsFavorite(false);
  }, [params?.id]);

  if (!match) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="py-8 container mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-start mb-6">
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="mb-6 sm:mb-0 sm:mr-8">
                  <div className="h-24 w-24 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="space-y-4 w-full">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-8 container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find the product you're looking for.
        </p>
        <Button onClick={() => setLocation('/')}>
          Return to Scanner
        </Button>
      </div>
    );
  }

  const { user } = useAuth();
  
  // Check if product is in user's favorites
  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: getFavorites,
    enabled: !!user, // Only run query if user is authenticated
    onSuccess: (data) => {
      // Check if this product is in favorites
      const isProductInFavorites = data?.some(fav => fav.productId === product.id);
      setIsFavorite(isProductInFavorites);
    }
  });

  const handleAddToFavorites = async () => {
    if (!user) {
      // Redirect to auth page if not logged in
      toast({
        title: "Login Required",
        description: "Please login to save products to favorites",
      });
      setLocation('/auth');
      return;
    }
    
    try {
      await addFavorite(product.id);
      
      setIsFavorite(true);
      toast({
        title: "Added to favorites",
        description: `${product.name} has been saved to your favorites`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to favorites",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `EcoScan: ${product.name}`,
        text: `Check out the sustainability rating for ${product.name}: ${product.ecoScore}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Failed to share', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  return (
    <main className="py-8 container mx-auto px-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Product Header */}
        <div className="flex items-start mb-6">
          <Button variant="ghost" size="icon" className="mr-4" onClick={() => setLocation('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold mb-1">{product.name}</h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-2">{product.brand}</span>
              <span>•</span>
              <span className="mx-2">{product.category}</span>
              <span>•</span>
              <span className="ml-2">{product.barcode}</span>
            </div>
          </div>
        </div>
        
        {/* Sustainability Score */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="mb-6 sm:mb-0 sm:mr-8">
                <EcoScore score={product.ecoScore} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4">Sustainability Rating</h3>
                
                {/* Individual Metrics */}
                <div className="space-y-4">
                  <MetricBar 
                    label="Materials" 
                    value={product.metrics.materials} 
                    colorScheme="primary" 
                  />
                  
                  <MetricBar 
                    label="Carbon Footprint" 
                    value={product.metrics.carbonFootprint} 
                    colorScheme="primary" 
                  />
                  
                  <MetricBar 
                    label="Recyclability" 
                    value={product.metrics.recyclability} 
                    colorScheme={product.metrics.recyclability < 80 ? "warning" : "primary"} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Impact Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Environmental Impact</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                <svg className="mx-auto h-6 w-6 text-primary-500 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 5.5C21 8.87 17 14.5 12 18C7 14.5 3 8.87 3 5.5C3 2.6 5.6 1 8.5 1C10.37 1 12 2 12 2C12 2 13.63 1 15.5 1C18.4 1 21 2.6 21 5.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">CO₂ Emissions</p>
                <p className="font-semibold">{product.impact.co2}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                <svg className="mx-auto h-6 w-6 text-blue-500 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Water Usage</p>
                <p className="font-semibold">{product.impact.water}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                <svg className="mx-auto h-6 w-6 text-amber-500 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 19L3 22.5V19H2C1.44772 19 1 18.5523 1 18V3C1 2.44772 1.44772 2 2 2H22C22.5523 2 23 2.44772 23 3V18C23 18.5523 22.5523 19 22 19H7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 10H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Packaging</p>
                <p className="font-semibold">{product.impact.packaging}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                <svg className="mx-auto h-6 w-6 text-primary-500 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 12 2 12 2C12 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Land Usage</p>
                <p className="font-semibold">{product.impact.land}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Product Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ingredients</h4>
                <p className="text-sm">{product.ingredients}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, index) => (
                    <span key={index} className={`px-2 py-1 bg-${cert.color}-100 dark:bg-${cert.color}-900/30 text-${cert.color}-800 dark:text-${cert.color}-300 rounded text-xs`}>
                      {cert.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Production Method</h4>
                <p className="text-sm">{product.production}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Packaging Details</h4>
                <p className="text-sm">{product.packaging_details}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* More Sustainable Alternatives */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Eco-Friendly Alternatives</h3>
              <Button variant="link" className="text-primary-600 dark:text-primary-400">
                See All
              </Button>
            </div>
            
            <div className="space-y-4">
              {alternatives.map((alt) => (
                <ProductCard key={alt.id} product={alt} />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Action buttons */}
        <div className="flex space-x-3 mb-6">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleShare}
          >
            <Share className="mr-2 h-5 w-5" />
            Share
          </Button>
          
          <Button 
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
            onClick={handleAddToFavorites}
            disabled={isFavorite}
          >
            <Heart className="mr-2 h-5 w-5" />
            {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
          </Button>
        </div>
      </div>
    </main>
  );
}
