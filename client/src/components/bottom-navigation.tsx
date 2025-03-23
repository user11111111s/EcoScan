import { Link, useLocation } from "wouter";
import { ScanLine, Search, Heart, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/favorites" && location === "/favorites") return true;
    return false;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-2 px-4 flex justify-around z-30 md:hidden">
      <Link href="/">
        <a className={`flex flex-col items-center justify-center p-2 ${isActive("/") ? "text-primary-500" : "text-gray-500 dark:text-gray-400"}`}>
          <ScanLine className="h-5 w-5" />
          <span className="text-xs mt-1">Scan</span>
        </a>
      </Link>
      
      <Link href="/">
        <a className="flex flex-col items-center justify-center p-2 text-gray-500 dark:text-gray-400">
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </a>
      </Link>
      
      <Link href="/favorites">
        <a className={`flex flex-col items-center justify-center p-2 ${isActive("/favorites") ? "text-primary-500" : "text-gray-500 dark:text-gray-400"}`}>
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Favorites</span>
        </a>
      </Link>
      
      <a className="flex flex-col items-center justify-center p-2 text-gray-500 dark:text-gray-400">
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Profile</span>
      </a>
    </nav>
  );
}
