import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Heart, Moon, Sun, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <svg className="h-6 w-6 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 21C7 18.2386 9.23858 16 12 16C14.7614 16 17 18.2386 17 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3C16.4183 3 20 6.58172 20 11C20 13.8214 18.5384 16.2919 16.3846 17.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3C7.58172 3 4 6.58172 4 11C4 13.8214 5.46155 16.2919 7.61538 17.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-xl font-bold">EcoScan</h1>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div>
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </Link>
          
          {user && (
            <Link href="/favorites">
              <div>
                <Button variant="ghost" size="icon" aria-label="Favorites">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-gray-200 dark:bg-slate-600 rounded-full" 
                aria-label="User profile"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                aria-label="Logout"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <div>
                <Button variant="ghost" size="icon" className="bg-gray-200 dark:bg-slate-600 rounded-full" aria-label="Login">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
