import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { productSchema, insertFavoriteSchema, insertSearchHistorySchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);
  // Get product by barcode
  app.get("/api/products/barcode/:barcode", async (req: Request, res: Response) => {
    try {
      const barcode = req.params.barcode;
      const product = await storage.getProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve product" });
    }
  });
  
  // Search products
  app.get("/api/products/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const products = await storage.searchProducts(query);
      
      // Add search to history if userId is provided
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      if (userId) {
        try {
          await storage.addSearchHistory({
            userId,
            query,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          // Continue even if adding to history fails
          console.error("Failed to add search to history", error);
        }
      }
      
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ message: "Failed to search products" });
    }
  });
  
  // Get product by ID
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve product" });
    }
  });
  
  // Add favorite
  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      
      // Validate that the product exists before adding to favorites
      if (favoriteData.productId) {
        const product = await storage.getProductById(favoriteData.productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
      }
      
      const favorite = await storage.addFavorite(favoriteData);
      return res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid favorite data", 
          errors: fromZodError(error).message 
        });
      }
      return res.status(500).json({ message: "Failed to add favorite" });
    }
  });
  
  // Get favorites by user ID
  app.get("/api/favorites/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const favorites = await storage.getFavoritesByUserId(userId);
      return res.json(favorites);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve favorites" });
    }
  });
  
  // Remove favorite
  app.delete("/api/favorites/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid favorite ID" });
      }
      
      const success = await storage.removeFavorite(id);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to remove favorite" });
    }
  });
  
  // Get recent searches
  app.get("/api/search-history/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const searches = await storage.getRecentSearches(userId, limit);
      
      return res.json(searches);
    } catch (error) {
      return res.status(500).json({ message: "Failed to retrieve search history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
