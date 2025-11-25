import { createSlice } from "@reduxjs/toolkit";

export interface AnalyticsData {
  sessions: number;
  users: string;
  pageViews: string;
  leads: string;
  conversions: string;
  sessionsTrend: number;
}

export interface RevenueData {
  amount: string;
  percentage: string;
  trend: "up" | "down";
}

export interface OrdersData {
  count: string;
  label: string;
}

export interface EarningReport {
  week: string;
  earnings: number;
}

export interface SupportTicket {
  type: string;
  count: number;
  color: string;
}

interface DashboardState {
  analytics: AnalyticsData;
  revenue: RevenueData;
  orders: OrdersData;
  visits: OrdersData;
  earningReports: EarningReport[];
  supportTickets: SupportTicket[];
  totalEarnings: string;
  earningsTrend: string;
  totalTickets: number;
  completionRate: number;
}

const initialState: DashboardState = {
  analytics: {
    sessions: 2845,
    users: "28%",
    pageViews: "3.1k",
    leads: "1.9k",
    conversions: "12%",
    sessionsTrend: 18.2,
  },
  revenue: {
    amount: "$42.5k",
    percentage: "+18.2%",
    trend: "up",
  },
  orders: {
    count: "8,458",
    label: "Orders",
  },
  visits: {
    count: "26.5k",
    label: "Visits",
  },
  earningReports: [
    { week: "Mo", earnings: 45 },
    { week: "Tu", earnings: 80 },
    { week: "We", earnings: 60 },
    { week: "Th", earnings: 95 },
    { week: "Fr", earnings: 45 },
    { week: "Sa", earnings: 70 },
    { week: "Su", earnings: 55 },
  ],
  supportTickets: [
    { type: "New Tickets", count: 142, color: "#9F7AEA" },
    { type: "Open Tickets", count: 28, color: "#4299E1" },
    { type: "Response Time", count: 1, color: "#F6AD55" },
  ],
  totalEarnings: "$468",
  earningsTrend: "+4.2%",
  totalTickets: 164,
  completionRate: 85,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    updateRevenue: (state, action) => {
      state.revenue = { ...state.revenue, ...action.payload };
    },
  },
});

export const { updateAnalytics, updateRevenue } = dashboardSlice.actions;
export default dashboardSlice.reducer;

