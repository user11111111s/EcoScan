import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share, Heart, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EcoScore from "@/components/eco-score";
import MetricBar from "@/components/metric-bar";
import ProductCard from "@/components/product-card";
import { getProductById, addFavorite, getFavorites, removeFavorite } from "@/lib/api";
import { type Product, type Alternative } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function ProductDetails() {
  const [match, params] = useRoute<{ id: string }>("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const queryClient = useQueryClient();

  // Product data query
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${params?.id}`],
    queryFn: () => getProductById(Number(params?.id)),
    enabled: !!params?.id,
  });

  // Favorites query
  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: getFavorites,
    enabled: !!user,
  });

  // Update favorite status when favorites data changes
  useEffect(() => {
    if (favorites && product) {
      const isProductInFavorites = favorites.some(fav => fav.productId === product.id);
      setIsFavorite(isProductInFavorites);
    }
  }, [favorites, product]);

  const handleToggleFavorite = async () => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    try {
      if (isFavorite) {
        const favorite = favorites?.find(f => f.productId === product?.id);
        if (favorite) {
          await removeFavorite(favorite.id);
          toast({
            title: "Removed from favorites",
            description: "Product removed from your favorites",
          });
        }
      } else {
        await addFavorite({ productId: product?.id });
        toast({
          title: "Added to favorites",
          description: "Product added to your favorites",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="py-8 container mx-auto text-center">
        <p>Loading...</p>
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

  return (
    <main className="py-8 container mx-auto px-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Product Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className={isFavorite ? 'text-red-500' : ''}
          >
            <Heart className="h-5 w-5" />
          </Button>
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
                <div className="mx-auto h-6 w-6 text-primary-500 mb-1">🌱</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">CO₂ Emissions</p>
                <p className="font-semibold">{product.impact.co2}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                <div className="mx-auto h-6 w-6 text-primary-500 mb-1">💧</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Water Usage</p>
                <p className="font-semibold">{product.impact.water}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                <div className="mx-auto h-6 w-6 text-primary-500 mb-1">♻️</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Packaging</p>
                <p className="font-semibold">{product.impact.packaging}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                <div className="mx-auto h-6 w-6 text-primary-500 mb-1">🌍</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Land Impact</p>
                <p className="font-semibold">{product.impact.land}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Production Information</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{product.production}</p>

            <h4 className="font-semibold mb-2">Ingredients:</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{product.ingredients}</p>

            <h4 className="font-semibold mb-2">Packaging Details:</h4>
            <p className="text-gray-600 dark:text-gray-400">{product.packaging_details}</p>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {product.certifications.map((cert, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium bg-${cert.color}-100 text-${cert.color}-800 dark:bg-${cert.color}-900/30 dark:text-${cert.color}-300`}
                >
                  {cert.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}