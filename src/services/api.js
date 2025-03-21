import axios from 'axios';
import dashboardConfig from '../dashboard.json';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDataSource = async (sourceKey, filters = {}) => {
  try {
    const dataSource = dashboardConfig.dataSources[sourceKey];
    
    if (!dataSource) {
      throw new Error(`Data source ${sourceKey} not found`);
    }

    const { url, method = 'GET' } = dataSource;
    
    const params = {};
    dashboardConfig.globalFilters.forEach(filter => {
      if (filter.appliesTo && filter.appliesTo.includes(sourceKey) && filters[filter.id]) {
        if (filter.type === 'dateRange') {
          params[`${filter.field}From`] = filters[filter.id].from;
          params[`${filter.field}To`] = filters[filter.id].to;
        } else {
          params[filter.field] = filters[filter.id];
        }
      }
    });

    const response = await api.request({
      url,
      method,
      params,
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching data source ${sourceKey}:`, error);
    throw error;
  }
};

// Mock data for development
export const getMockData = (sourceKey) => {
  if (sourceKey === 'salesData') {
    const rawData = [
      { month: 'Jan', product: 'Widget A', sales: 120, revenue: 12000 },
      { month: 'Feb', product: 'Widget A', sales: 150, revenue: 15000 },
      { month: 'Mar', product: 'Widget A', sales: 200, revenue: 20000 },
      { month: 'Apr', product: 'Widget A', sales: 180, revenue: 18000 },
      { month: 'May', product: 'Widget A', sales: 220, revenue: 22000 },
      { month: 'Jun', product: 'Widget A', sales: 250, revenue: 25000 },
      { month: 'Jan', product: 'Widget B', sales: 80, revenue: 8800 },
      { month: 'Feb', product: 'Widget B', sales: 100, revenue: 11000 },
      { month: 'Mar', product: 'Widget B', sales: 130, revenue: 14300 },
      { month: 'Apr', product: 'Widget B', sales: 90, revenue: 9900 },
      { month: 'May', product: 'Widget B', sales: 110, revenue: 12100 },
      { month: 'Jun', product: 'Widget B', sales: 140, revenue: 15400 },
      { month: 'Jan', product: 'Widget C', sales: 60, revenue: 7200 },
      { month: 'Feb', product: 'Widget C', sales: 75, revenue: 9000 },
      { month: 'Mar', product: 'Widget C', sales: 95, revenue: 11400 },
      { month: 'Apr', product: 'Widget C', sales: 70, revenue: 8400 },
      { month: 'May', product: 'Widget C', sales: 85, revenue: 10200 },
      { month: 'Jun', product: 'Widget C', sales: 105, revenue: 12600 },
    ];

    // Create aggregated data for pie charts
    const productSummary = {};
    rawData.forEach(item => {
      if (!productSummary[item.product]) {
        productSummary[item.product] = { product: item.product, sales: 0, revenue: 0 };
      }
      productSummary[item.product].sales += item.sales;
      productSummary[item.product].revenue += item.revenue;
    });

    // For time series charts - aggregate by month across all products
    const monthSummary = {};
    rawData.forEach(item => {
      if (!monthSummary[item.month]) {
        monthSummary[item.month] = { month: item.month, sales: 0, revenue: 0 };
      }
      monthSummary[item.month].sales += item.sales;
      monthSummary[item.month].revenue += item.revenue;
    });

    return {
      data: rawData,
      aggregations: {
        byProduct: Object.values(productSummary),
        byMonth: Object.values(monthSummary).sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(a.month) - months.indexOf(b.month);
        })
      }
    };
  }
  
  if (sourceKey === 'userMetrics') {
    return {
      data: [
        { month: 'Jan', activeUsers: 1200, newUsers: 450, churnRate: 2.5, avgSessionTime: 8.2 },
        { month: 'Feb', activeUsers: 1400, newUsers: 520, churnRate: 2.3, avgSessionTime: 9.1 },
        { month: 'Mar', activeUsers: 1600, newUsers: 580, churnRate: 2.1, avgSessionTime: 9.8 },
        { month: 'Apr', activeUsers: 1800, newUsers: 620, churnRate: 2.0, avgSessionTime: 10.2 },
        { month: 'May', activeUsers: 2000, newUsers: 700, churnRate: 1.8, avgSessionTime: 10.5 },
        { month: 'Jun', activeUsers: 2200, newUsers: 750, churnRate: 1.7, avgSessionTime: 11.0 },
        { month: 'Jul', activeUsers: 2350, newUsers: 780, churnRate: 1.6, avgSessionTime: 11.2 },
        { month: 'Aug', activeUsers: 2500, newUsers: 800, churnRate: 1.5, avgSessionTime: 11.5 },
        { month: 'Sep', activeUsers: 2650, newUsers: 820, churnRate: 1.4, avgSessionTime: 11.8 },
        { month: 'Oct', activeUsers: 2800, newUsers: 850, churnRate: 1.3, avgSessionTime: 12.0 },
        { month: 'Nov', activeUsers: 2950, newUsers: 880, churnRate: 1.2, avgSessionTime: 12.3 },
        { month: 'Dec', activeUsers: 3100, newUsers: 900, churnRate: 1.1, avgSessionTime: 12.5 }
      ]
    };
  }
  
  if (sourceKey === 'regions') {
    return {
      data: [
        { id: 'na', name: 'North America' },
        { id: 'eu', name: 'Europe' },
        { id: 'apac', name: 'Asia Pacific' },
        { id: 'latam', name: 'Latin America' },
      ]
    };
  }
  
  return { data: [] };
};