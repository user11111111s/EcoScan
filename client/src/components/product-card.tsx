import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { type Product, type Alternative } from "@shared/schema";
import EcoScore from "./eco-score";

interface ProductCardProps {
  product: Alternative | Partial<Product>;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  if (!product.id || !product.name || !product.ecoScore) {
    return null;
  }
  
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="flex items-center p-3 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={onClick}>
        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-md flex items-center justify-center mr-4">
          <EcoScore score={product.ecoScore} size="sm" />
        </div>
        <CardContent className="flex-1 p-0">
          <h4 className="font-medium text-sm">{product.name}</h4>
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 text-xs text-green-800 dark:text-green-300 px-2 py-0.5 rounded mr-2">
              {product.ecoScore}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {"feature" in product ? product.feature : (product.brand || '')}
            </span>
          </div>
        </CardContent>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </Card>
    </Link>
  );
}
