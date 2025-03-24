import { Link, useLocation } from "wouter";
import { ScanLine, Search, Heart, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/favorites" && location === "/favorites") return true;
    if (path === "/auth" && location === "/auth") return true;
    return false;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-2 px-4 flex justify-around z-30 md:hidden">
      <Link href="/">
        <div className={`flex flex-col items-center justify-center p-2 cursor-pointer ${isActive("/") ? "text-primary-500" : "text-gray-500 dark:text-gray-400"}`}>
          <ScanLine className="h-5 w-5" />
          <span className="text-xs mt-1">Scan</span>
        </div>
      </Link>
      
      <Link href="/">
        <div className="flex flex-col items-center justify-center p-2 cursor-pointer text-gray-500 dark:text-gray-400">
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </div>
      </Link>
      
      {user ? (
        <Link href="/favorites">
          <div className={`flex flex-col items-center justify-center p-2 cursor-pointer ${isActive("/favorites") ? "text-primary-500" : "text-gray-500 dark:text-gray-400"}`}>
            <Heart className="h-5 w-5" />
            <span className="text-xs mt-1">Favorites</span>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col items-center justify-center p-2 text-gray-300 dark:text-gray-600">
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Favorites</span>
        </div>
      )}
      
      <Link href={user ? "/" : "/auth"}>
        <div className={`flex flex-col items-center justify-center p-2 cursor-pointer ${isActive("/auth") ? "text-primary-500" : "text-gray-500 dark:text-gray-400"}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{user ? "Profile" : "Login"}</span>
        </div>
      </Link>
    </nav>
  );
}
