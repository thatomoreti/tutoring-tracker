const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function get(path) {
  const res = await fetch(`${BASE_URL}/reports/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path} report`);
  return res.json();
}

export const getDashboardStats = () => get('dashboard');
export const getBalances = () => get('balances');
export const getRevenueByMonth = () => get('revenue');
export const getAttendanceSummary = () => get('attendance');