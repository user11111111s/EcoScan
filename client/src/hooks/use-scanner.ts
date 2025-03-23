import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getProductByBarcode, searchProducts } from "@/lib/api";
import { type Product } from "@shared/schema";

interface UseScannerReturn {
  isLoading: boolean;
  error: string | null;
  product: Product | null;
  scanBarcode: (barcode: string) => Promise<Product | null>;
  searchProduct: (query: string) => Promise<Product[]>;
  resetState: () => void;
}

export function useScanner(): UseScannerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setProduct(null);
  }, []);

  const scanBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const product = await getProductByBarcode(barcode);
      
      if (!product) {
        setError(`No product found with barcode ${barcode}`);
        toast({
          title: "Product not found",
          description: `We couldn't find a product with barcode ${barcode}`,
          variant: "destructive",
        });
        return null;
      }
      
      setProduct(product);
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to scan product";
      setError(errorMessage);
      toast({
        title: "Scan Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const searchProduct = useCallback(async (query: string): Promise<Product[]> => {
    if (!query.trim()) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const products = await searchProducts(query);
      
      if (products.length === 0) {
        toast({
          title: "No products found",
          description: `We couldn't find any products matching "${query}"`,
          variant: "default",
        });
      }
      
      return products;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search products";
      setError(errorMessage);
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    product,
    scanBarcode,
    searchProduct,
    resetState,
  };
}
