import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/header";
import BottomNavigation from "./components/bottom-navigation";
import Home from "./pages/home";
import ProductDetails from "./pages/product-details";
import Favorites from "./pages/favorites";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetails} />
      <ProtectedRoute path="/favorites" component={Favorites} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for user preference
    if (localStorage.getItem('darkMode') === 'true' ||
        (localStorage.getItem('darkMode') === null &&
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100 transition-colors duration-200">
          <AuthProvider>
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Router />
            <BottomNavigation />
          </AuthProvider>
          <Toaster />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
