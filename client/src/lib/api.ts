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
export async function addFavorite(favorite: InsertFavorite): Promise<Favorite> {
  try {
    const response = await apiRequest("POST", "/api/favorites", favorite);
    return await response.json();
  } catch (error) {
    console.error("Failed to add favorite:", error);
    throw error;
  }
}

export async function getFavoritesByUserId(userId: number): Promise<Favorite[]> {
  try {
    const response = await fetch(`/api/favorites/user/${userId}`, {
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
export async function getRecentSearches(userId: number, limit: number = 10): Promise<SearchHistory[]> {
  try {
    const response = await fetch(`/api/search-history/user/${userId}?limit=${limit}`, {
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
