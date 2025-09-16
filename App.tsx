import React, { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AddDataView } from './components/AddDataView';
import { DashboardData, View } from './types';
import { generateInitialData } from './services/dataService';

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const Header: React.FC<{
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isCollapsed, setIsCollapsed }) => (
    <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
        <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-text-secondary hover:bg-base-300/60"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-4">
            <span className="font-semibold text-text-primary hidden sm:block">Vitor W</span>
            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg cursor-pointer">
                V
            </div>
        </div>
    </header>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [dashboardData, setDashboardData] = useState<DashboardData>(generateInitialData(true));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const sidebarWidth = 256; // Corresponds to w-64 in TailwindCSS (16rem * 16px/rem)
  const swipeThreshold = 50; // Minimum distance for a swipe

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) {
      return;
    }

    const touchEnd = e.changedTouches[0].clientX;
    const touchDistance = touchEnd - touchStartRef.current;
    const startX = touchStartRef.current;
    
    // Swipe right to open: must start near the left edge when collapsed
    if (isCollapsed && touchDistance > swipeThreshold && startX < swipeThreshold) {
      setIsCollapsed(false);
    }

    // Swipe left to close: must start within the sidebar area when open
    if (!isCollapsed && touchDistance < -swipeThreshold && startX < sidebarWidth) {
      setIsCollapsed(true);
    }

    touchStartRef.current = null;
  };

  const handleResetData = useCallback(() => {
    setDashboardData(generateInitialData(true));
  }, []);

  const handleUpdateData = useCallback((dataToAdd: Partial<DashboardData>) => {
    setDashboardData(prevData => {
        const newTransactions = dataToAdd.transactions 
            ? [...dataToAdd.transactions, ...prevData.transactions] 
            : prevData.transactions;
        
        const dailyDataMap = new Map<string, { sales: number, transactions: number }>();
        
        prevData.dailyData.forEach(d => {
            dailyDataMap.set(d.date, { sales: d.sales, transactions: d.transactions });
        });

        if (dataToAdd.dailyData) {
            dataToAdd.dailyData.forEach(newDay => {
                const existingDay = dailyDataMap.get(newDay.date) || { sales: 0, transactions: 0 };
                existingDay.sales += newDay.sales;
                existingDay.transactions += newDay.transactions;
                dailyDataMap.set(newDay.date, existingDay);
            });
        }
        
        const newDailyData = Array.from(dailyDataMap.entries()).map(([date, data]) => ({ date, ...data }));

        return {
            transactions: newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            dailyData: newDailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };
    });
  }, []);


  return (
    <div 
      className="flex h-screen bg-base-200 text-text-primary font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Sidebar activeView={activeView} setActiveView={setActiveView} isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
            {activeView === View.Dashboard && <DashboardView data={dashboardData} />}
            {activeView === View.Team && <AddDataView onUpdateData={handleUpdateData} onResetData={handleResetData} />}
        </main>
      </div>
    </div>
  );
};

export default App;