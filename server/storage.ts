import { users, type User, type InsertUser } from "@shared/schema";
import { 
  type Product, 
  type InsertProduct,
  type Favorite,
  type InsertFavorite,
  type SearchHistory,
  type InsertSearchHistory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  
  // Favorite methods
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  removeFavorite(id: number): Promise<boolean>;
  
  // Search history methods
  addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  getRecentSearches(userId: number, limit: number): Promise<SearchHistory[]>;
  
  // Session store
  sessionStore: session.Store;
}

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Organic Oat Milk",
    brand: "EcoFoods",
    category: "Dairy Alternatives",
    barcode: "8901234567890",
    ecoScore: "A+",
    metrics: {
      materials: 92,
      carbonFootprint: 85,
      recyclability: 78
    },
    impact: {
      co2: "0.4kg CO₂e",
      water: "48 liters",
      packaging: "78% Recyclable",
      land: "Minimal Impact"
    },
    ingredients: "Oats (water, organic oats), sunflower oil, sea salt, natural flavors.",
    certifications: [
      { name: "Organic", color: "green" },
      { name: "Non-GMO", color: "blue" },
      { name: "Vegan", color: "amber" }
    ],
    production: "Made using renewable energy sources. Water-efficient processing.",
    packaging_details: "Tetra Pak with plant-based cap. Please rinse and recycle where facilities exist."
  },
  {
    id: 2,
    name: "Bamboo Toothbrush",
    brand: "EcoSmile",
    category: "Personal Care",
    barcode: "7809123456789",
    ecoScore: "A",
    metrics: {
      materials: 95,
      carbonFootprint: 90,
      recyclability: 80
    },
    impact: {
      co2: "0.2kg CO₂e",
      water: "15 liters",
      packaging: "100% Compostable",
      land: "Sustainable bamboo"
    },
    ingredients: "Bamboo handle, plant-based bristles, natural dyes.",
    certifications: [
      { name: "Plastic-Free", color: "blue" },
      { name: "Biodegradable", color: "green" }
    ],
    production: "Handcrafted using sustainable bamboo. Low-impact manufacturing.",
    packaging_details: "Cardboard packaging made from recycled materials. Fully compostable."
  },
  {
    id: 3,
    name: "Organic Quinoa",
    brand: "EcoFoods",
    category: "Grains",
    barcode: "123456789012",
    ecoScore: "A",
    metrics: {
      materials: 88,
      carbonFootprint: 82,
      recyclability: 95
    },
    impact: {
      co2: "0.3kg CO₂e",
      water: "25 liters",
      packaging: "95% Recyclable",
      land: "Sustainable farming"
    },
    ingredients: "100% Organic Quinoa",
    certifications: [
      { name: "Organic", color: "green" },
      { name: "Fair Trade", color: "blue" }
    ],
    production: "Sustainably farmed using traditional methods.",
    packaging_details: "Paper packaging from recycled materials."
  },
  {
    id: 4,
    name: "Recycled Paper Towels",
    brand: "EcoClean",
    category: "Household",
    barcode: "456789012345",
    ecoScore: "A-",
    metrics: {
      materials: 85,
      carbonFootprint: 75,
      recyclability: 100
    },
    impact: {
      co2: "0.5kg CO₂e",
      water: "30 liters",
      packaging: "100% Recyclable",
      land: "Low impact"
    },
    ingredients: "100% recycled paper fibers",
    certifications: [
      { name: "Recycled", color: "green" }
    ],
    production: "Made from post-consumer recycled materials.",
    packaging_details: "Minimal recycled cardboard packaging."
  }


];

// Setup memory store for sessions
const MemoryStore = createMemoryStore(session);

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private favorites: Map<number, Favorite>;
  private searches: Map<number, SearchHistory>;
  
  currentUserId: number;
  currentProductId: number;
  currentFavoriteId: number;
  currentSearchId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.favorites = new Map();
    this.searches = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = mockProducts.length + 1;
    this.currentFavoriteId = 1;
    this.currentSearchId = 1;
    
    // Initialize with mock products
    mockProducts.forEach(product => {
      this.products.set(product.id, product);
    });
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // Extract the fields we need with proper defaults
    const { username, password } = insertUser;
    // Create the user with explicit fields to avoid type issues
    const user: User = { 
      id, 
      username, 
      password,
      name: insertUser.name ?? "",
      email: insertUser.email ?? ""
    };
    this.users.set(id, user);
    return user;
  }
  
  // Product methods
  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.barcode === barcode,
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowerQuery) || 
        product.brand.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        product.barcode.includes(query)
    );
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  // Favorite methods
  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    // Ensure required fields are present
    const favorite: Favorite = { 
      ...insertFavorite, 
      id,
      userId: insertFavorite.userId ?? null,
      productId: insertFavorite.productId ?? null,
    };
    this.favorites.set(id, favorite);
    return favorite;
  }
  
  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }
  
  async removeFavorite(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }
  
  // Search history methods
  async addSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.currentSearchId++;
    const history: SearchHistory = { 
      ...insertHistory, 
      id, 
      userId: insertHistory.userId ?? null 
    };
    this.searches.set(id, history);
    return history;
  }
  
  async getRecentSearches(userId: number, limit: number): Promise<SearchHistory[]> {
    return Array.from(this.searches.values())
      .filter(search => search.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
