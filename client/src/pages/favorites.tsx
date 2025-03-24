import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import ProductCard from "@/components/product-card";
import { getFavorites, removeFavorite } from "@/lib/api";
import { type Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Favorites() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: favorites, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: () => getFavorites(),
    enabled: !!user // Only run the query if the user is authenticated
  });
  
  const handleRemoveFavorite = async (id: number) => {
    try {
      await removeFavorite(id);
      refetch();
      
      toast({
        title: "Removed from favorites",
        description: "The product has been removed from your favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove product from favorites",
        variant: "destructive",
      });
    }
  };
  
  return (
    <main className="container mx-auto px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => setLocation('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Favorite Products</h1>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-md mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">Failed to load favorites</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : favorites && favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative">
                <ProductCard 
                  product={favorite.productData as Product} 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500" 
                  onClick={() => handleRemoveFavorite(favorite.id)}
                >
                  <Heart className="h-5 w-5 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Save sustainable products to your favorites for quick access
              </p>
              <Button onClick={() => setLocation('/')} className="bg-primary-500 hover:bg-primary-600 text-white">
                Scan Products
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
