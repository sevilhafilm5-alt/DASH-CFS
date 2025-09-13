export interface Transaction {
  id: string;
  product: string;
  date: string;
  amount: number;
  status: 'Aprovado' | 'Pendente' | 'Recusado';
}

export interface DailyData {
  date: string;
  sales: number;
  transactions: number;
}

export interface DashboardData {
  transactions: Transaction[];
  dailyData: DailyData[];
}

export enum View {
  Dashboard = 'DASHBOARD',
  Team = 'TEAM',
}

export enum TimeRange {
    Day = 'day',
    Week = 'week',
    Month = 'month',
    All = 'all',
}

export enum TimeOfDay {
  Morning = 'MORNING', // 6am to 12pm
  Afternoon = 'AFTERNOON', // 12pm to 6pm
  Evening = 'EVENING', // 6pm to 6am
}
