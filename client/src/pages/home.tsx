import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Clock, BarChart } from "lucide-react";
import ScanSection from "@/components/scan-section";

export default function Home() {
  // Hardcoded recent searches for now
  const recentSearches = ["Oat Milk", "Paper Towels", "Dish Soap"];
  const [activeTab, setActiveTab] = useState("scanner");
  
  return (
    <main className="container mx-auto px-4 pb-24">
      <Tabs defaultValue="scanner" value={activeTab} onValueChange={setActiveTab}>
        <div className="pt-4 pb-2 border-b border-gray-200 dark:border-slate-700">
          <TabsList className="bg-transparent p-0 h-auto gap-6">
            <TabsTrigger 
              value="scanner" 
              className="px-1 py-2 border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500 bg-transparent h-auto rounded-none"
            >
              <ScanLine className="mr-2 h-4 w-4" />
              Scanner
            </TabsTrigger>
            
            <TabsTrigger 
              value="history" 
              className="px-1 py-2 border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500 bg-transparent h-auto rounded-none"
            >
              <Clock className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
            
            <TabsTrigger 
              value="impact" 
              className="px-1 py-2 border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500 bg-transparent h-auto rounded-none"
            >
              <BarChart className="mr-2 h-4 w-4" />
              Impact
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="scanner" className="mt-0">
          <ScanSection recentSearches={recentSearches} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <div className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Scan History</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your previously scanned products will appear here
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="impact" className="mt-0">
          <div className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Environmental Impact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your environmental savings by choosing sustainable products
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
