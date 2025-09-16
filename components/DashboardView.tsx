import React, { useState, useMemo, useEffect } from 'react';
import { DashboardData, Transaction, DailyData, TimeOfDay } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardViewProps {
  data: DashboardData;
}

const WelcomeHeader: React.FC = () => {
    const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({ text: '', emoji: '' });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting({ text: 'Bom dia!', emoji: '☀️' });
        } else if (hour >= 12 && hour < 18) {
            setGreeting({ text: 'Boa tarde!', emoji: '👋' });
        } else {
            setGreeting({ text: 'Boa noite!', emoji: '🌙' });
        }
    }, []);

    return (
        <h2 className="text-3xl font-bold text-text-primary">
            Olá Vitor, {greeting.text} {greeting.emoji}
        </h2>
    );
};

const MetricCard: React.FC<{ title: string; value: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => (
  <div className="bg-base-100 p-6 rounded-xl shadow-sm">
    <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
    <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
    {change && (
      <div className={`text-sm mt-2 flex items-center ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
        {changeType === 'increase' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
        )}
        <span>{change}</span>
      </div>
    )}
  </div>
);

const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center";
    const statusClasses = {
        Aprovado: "bg-green-100 text-green-800",
        Pendente: "bg-yellow-100 text-yellow-800",
        Recusado: "bg-red-100 text-red-800",
    };
    const dotClasses = {
        Aprovado: "bg-green-500",
        Pendente: "bg-yellow-500",
        Recusado: "bg-red-500",
    }

    return (
        <span className={`${baseClasses} ${statusClasses[status]}`}>
            <span className={`w-2 h-2 mr-1.5 rounded-full ${dotClasses[status]}`}></span>
            {status}
        </span>
    );
};

const timeOfDayOptions: { id: TimeOfDay; label: string }[] = [
    { id: TimeOfDay.Morning, label: 'Manhã' },
    { id: TimeOfDay.Afternoon, label: 'Tarde' },
    { id: TimeOfDay.Evening, label: 'Noite' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ data }) => {
  const { minDate, maxDate } = useMemo(() => {
    if (data.transactions.length === 0) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return { 
            minDate: thirtyDaysAgo.toISOString().split('T')[0], 
            maxDate: today.toISOString().split('T')[0] 
        };
    }
    const dates = data.transactions.map(t => new Date(t.date).getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    return {
        minDate: min.toISOString().split('T')[0],
        maxDate: max.toISOString().split('T')[0],
    };
  }, [data.transactions]);
  
  const [startDate, setStartDate] = useState<string>(minDate);
  const [endDate, setEndDate] = useState<string>(maxDate);
  const [selectedTimes, setSelectedTimes] = useState<Set<TimeOfDay>>(new Set());

  useEffect(() => {
    setStartDate(minDate);
    setEndDate(maxDate);
  }, [minDate, maxDate]);

  const handleTimeFilterChange = (time: TimeOfDay) => {
    setSelectedTimes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(time)) {
            newSet.delete(time);
        } else {
            newSet.add(time);
        }
        return newSet;
    });
  };

  const {
    filteredDailyData,
    transactionsInView,
    totalSales,
    totalTransactionsCount,
    approvedTransactionsCount,
    conversionRate
  } = useMemo(() => {
      const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
      const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

      if (!start || !end || start > end) {
          return {
              filteredDailyData: [], transactionsInView: [], totalSales: 0,
              totalTransactionsCount: 0, approvedTransactionsCount: 0, conversionRate: '0.0'
          };
      }

      const isDateInRange = (date: Date) => date >= start && date <= end;
      
      let transactions = data.transactions.filter(t => isDateInRange(new Date(t.date)));

      if (selectedTimes.size > 0) {
          transactions = transactions.filter(t => {
              const hour = new Date(t.date).getHours();
              if (selectedTimes.has(TimeOfDay.Morning) && hour >= 6 && hour < 12) return true;
              if (selectedTimes.has(TimeOfDay.Afternoon) && hour >= 12 && hour < 18) return true;
              if (selectedTimes.has(TimeOfDay.Evening) && (hour >= 18 || hour < 6)) return true;
              return false;
          });
      }

      const approvedTransactions = transactions.filter(t => t.status === 'Aprovado');

      const dailyDataMap = new Map<string, { sales: number; transactions: number }>();
      approvedTransactions.forEach(t => {
          const dateString = new Date(t.date).toISOString().split('T')[0];
          const dayEntry = dailyDataMap.get(dateString) || { sales: 0, transactions: 0 };
          dayEntry.sales += t.amount;
          dayEntry.transactions += 1;
          dailyDataMap.set(dateString, dayEntry);
      });

      const allDatesInRange: string[] = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
          allDatesInRange.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
      }
      
      const dailyData = allDatesInRange.map(dateString => {
          const data = dailyDataMap.get(dateString) || { sales: 0, transactions: 0 };
          return { date: dateString, ...data };
      });

      const sales = approvedTransactions.reduce((sum, item) => sum + item.amount, 0);
      const totalCount = transactions.length;
      const approvedCount = approvedTransactions.length;
      const conversion = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : '0.0';

      return {
          filteredDailyData: dailyData,
          transactionsInView: transactions,
          totalSales: sales,
          totalTransactionsCount: totalCount,
          approvedTransactionsCount: approvedCount,
          conversionRate: conversion,
      };
  }, [data, startDate, endDate, selectedTimes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <WelcomeHeader />
        <div className="flex flex-col items-start sm:items-end gap-2 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-base-100 p-2 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                    <label htmlFor="start-date" className="text-sm font-medium text-text-secondary">De:</label>
                    <input 
                        id="start-date" type="date" value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                        max={endDate}
                        className="bg-base-200 border border-base-300 rounded-md px-2 py-1 text-sm focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="end-date" className="text-sm font-medium text-text-secondary">Até:</label>
                    <input 
                        id="end-date" type="date" value={endDate} 
                        onChange={e => setEndDate(e.target.value)}
                        min={startDate}
                        className="bg-base-200 border border-base-300 rounded-md px-2 py-1 text-sm focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 bg-base-100 p-2 rounded-lg shadow-sm w-full sm:w-auto justify-between">
                <span className="text-sm font-medium text-text-secondary">Período:</span>
                <div className="flex items-center space-x-2">
                {timeOfDayOptions.map(option => (
                    <button
                    key={option.id}
                    onClick={() => handleTimeFilterChange(option.id)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        selectedTimes.has(option.id)
                        ? 'bg-brand-primary text-white'
                        : 'bg-base-200 hover:bg-base-300 text-text-secondary'
                    }`}
                    >
                    {option.label}
                    </button>
                ))}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Vendas Totais" value={`R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <MetricCard title="Transações" value={totalTransactionsCount.toString()} />
        <MetricCard title="Aprovadas" value={approvedTransactionsCount.toString()} />
        <MetricCard title="Conversão" value={`${conversionRate}%`} />
      </div>

      <div className="bg-base-100 p-6 rounded-xl shadow-sm">
         <h3 className="text-lg font-semibold text-text-primary mb-4">Visão Geral das Vendas</h3>
         <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={filteredDailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#635BFF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#635BFF" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })} />
                    <YAxis tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Vendas"]}/>
                    <Area type="monotone" dataKey="sales" stroke="#635BFF" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

       <div className="bg-base-100 p-6 rounded-xl shadow-sm">
         <h3 className="text-lg font-semibold text-text-primary mb-4">Transações Recentes</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-base-300">
                    <tr className="text-sm text-text-secondary">
                        <th className="py-3 px-4 font-medium">Produto</th>
                        <th className="py-3 px-4 font-medium">Data</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium text-right">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {transactionsInView.slice(0, 10).map((t) => (
                        <tr key={t.id} className="border-b border-base-300 last:border-b-0 hover:bg-base-200/50">
                            <td className="py-4 px-4 font-medium text-text-primary">{t.product}</td>
                            <td className="py-4 px-4 text-text-secondary">{new Date(t.date).toLocaleString('pt-BR')}</td>
                            <td className="py-4 px-4"><StatusBadge status={t.status} /></td>
                            <td className="py-4 px-4 font-semibold text-right text-text-primary">R$ {t.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
       </div>

    </div>
  );
};