import { queryClient, apiRequest } from "./queryClient";
import { 
  type Product, 
  type Favorite, 
  type InsertFavorite, 
  type SearchHistory 
} from "@shared/schema";

// Product API
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/barcode/${barcode}`, {
      credentials: "include",
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch product by barcode:", error);
    throw error;
  }
}

export async function searchProducts(query: string, userId?: number): Promise<Product[]> {
  try {
    const userParam = userId ? `&userId=${userId}` : '';
    const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}${userParam}`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Error searching products: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to search products:", error);
    throw error;
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      credentials: "include",
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch product by ID:", error);
    throw error;
  }
}

// Favorites API
export async function addFavorite(productId: number): Promise<Favorite> {
  try {
    // We don't need to provide userId anymore as the server will get it from the session
    const response = await apiRequest("POST", "/api/favorites", { productId });
    const result = await response.json();
    // Invalidate favorites cache on successful addition
    queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    return result;
  } catch (error) {
    console.error("Failed to add favorite:", error);
    throw error;
  }
}

export async function getFavorites(): Promise<Favorite[]> {
  try {
    const response = await fetch(`/api/favorites`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching favorites: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    throw error;
  }
}

// Legacy function maintained for backward compatibility, can be removed later
export async function getFavoritesByUserId(userId: number): Promise<Favorite[]> {
  console.warn('getFavoritesByUserId is deprecated. Use getFavorites instead.');
  return getFavorites();
}

export async function removeFavorite(id: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/favorites/${id}`);
    // Invalidate favorites cache
    queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    throw error;
  }
}

// Search History API
export async function getRecentSearches(limit: number = 10): Promise<SearchHistory[]> {
  try {
    const response = await fetch(`/api/search-history?limit=${limit}`, {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching search history: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch search history:", error);
    throw error;
  }
}

// Legacy function maintained for backward compatibility, can be removed later
export async function getRecentSearchesByUserId(userId: number, limit: number = 10): Promise<SearchHistory[]> {
  console.warn('getRecentSearchesByUserId is deprecated. Use getRecentSearches instead.');
  return getRecentSearches(limit);
}
