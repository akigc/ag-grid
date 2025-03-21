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
    return {
      data: [
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
      ]
    };
  }
  
  if (sourceKey === 'userMetrics') {
    return {
      data: [
        { month: 'Jan', activeUsers: 1200, signups: 450 },
        { month: 'Feb', activeUsers: 1400, signups: 520 },
        { month: 'Mar', activeUsers: 1600, signups: 580 },
        { month: 'Apr', activeUsers: 1800, signups: 620 },
        { month: 'May', activeUsers: 2000, signups: 700 },
        { month: 'Jun', activeUsers: 2200, signups: 750 },
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