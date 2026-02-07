// src/services/adminService.js
const BASE_URL = '/api/admin';

export const adminService = {
  // Get KPI data (Derived from multiple endpoints if necessary)
  async getDashboardSummary() {
    const [capacity, containers] = await Promise.all([
      fetch(`${BASE_URL}/data/capacity`).then(res => res.json()),
      fetch(`${BASE_URL}/data/containers`).then(res => res.json())
    ]);
    return { capacity, containers };
  },

  // Get Hourly Usage Chart data
  async getHourlyUsage(date) {
    const response = await fetch(`${BASE_URL}/data/schedule/${date}`);
    return response.json(); // Returns { schedule: [...] } [cite: 237, 243]
  },

  // Get Pending Alerts
  async getPendingAlerts() {
    const response = await fetch(`/api/report/pending`); // [cite: 363]
    return response.json();
  }
};