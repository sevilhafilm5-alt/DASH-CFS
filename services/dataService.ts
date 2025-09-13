
import { DashboardData, Transaction, DailyData } from '../types';

const PRODUCT_NAMES = [
  'Sérum Vitamina C', 'Creme Hidratante Facial', 'Protetor Solar FPS 50', 'Máscara de Cílios', 'Base Líquida Matte',
  'Corretivo Alta Cobertura', 'Batom Vermelho Intenso', 'Paleta de Sombras Nude', 'Delineador em Gel', 'Água Micelar'
];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const generateInitialData = (empty: boolean = false): DashboardData => {
  if (empty) {
    return { transactions: [], dailyData: [] };
  }

  const transactions: Transaction[] = [];
  const dailyDataMap: Map<string, { sales: number; transactions: number }> = new Map();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  for (let i = 0; i < 75; i++) {
    const date = generateRandomDate(startDate, endDate);
    const amount = Math.floor(Math.random() * 450) + 50;
    const statusOptions: Transaction['status'][] = ['Aprovado', 'Aprovado', 'Aprovado', 'Pendente', 'Recusado'];
    
    const transaction: Transaction = {
      id: `tr_${Date.now()}_${i}`,
      product: getRandomItem(PRODUCT_NAMES),
      date: date.toISOString(),
      amount,
      status: getRandomItem(statusOptions),
    };
    transactions.push(transaction);

    if (transaction.status === 'Aprovado') {
        const dateString = date.toISOString().split('T')[0];
        const dayEntry = dailyDataMap.get(dateString) || { sales: 0, transactions: 0 };
        dayEntry.sales += amount;
        dayEntry.transactions += 1;
        dailyDataMap.set(dateString, dayEntry);
    }
  }

  const dailyData: DailyData[] = Array.from(dailyDataMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return {
    transactions: transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    dailyData,
  };
};