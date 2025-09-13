import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AddDataView } from './components/AddDataView';
import { DashboardData, View } from './types';
import { generateInitialData } from './services/dataService';

const Header: React.FC = () => (
    <header className="flex justify-end items-center px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
            <span className="font-semibold text-text-primary hidden sm:block">Frank W</span>
            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg cursor-pointer">
                F
            </div>
        </div>
    </header>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [dashboardData, setDashboardData] = useState<DashboardData>(generateInitialData(true));

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
    <div className="flex h-screen bg-base-200 text-text-primary font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
            {activeView === View.Dashboard && <DashboardView data={dashboardData} />}
            {activeView === View.Team && <AddDataView onUpdateData={handleUpdateData} onResetData={handleResetData} />}
        </main>
      </div>
    </div>
  );
};

export default App;