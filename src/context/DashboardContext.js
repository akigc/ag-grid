import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import dashboardConfig from '../dashboard.json';
import { fetchDataSource, getMockData } from '../services/api';

const DashboardContext = createContext();

// Use Development Mode with mock data
const USE_MOCK_DATA = true;

export const DashboardProvider = ({ children }) => {
  const [filters, setFilters] = useState({});
  const [dataSources, setDataSources] = useState({});
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState(dashboardConfig.tabs[0]?.id);
  const [interactionFilters, setInteractionFilters] = useState({});
  const [rawSalesData, setRawSalesData] = useState([]);
  const [rawUserMetricsData, setRawUserMetricsData] = useState([]);
  // Map to store relationships between products and months for filtering
  const [productMonthMap, setProductMonthMap] = useState({});

  useEffect(() => {
    const defaultFilters = {};
    dashboardConfig.globalFilters.forEach(filter => {
      if (filter.default) {
        defaultFilters[filter.id] = filter.default;
      }
    });
    setFilters(defaultFilters);

    // Initialize raw data
    if (USE_MOCK_DATA) {
      const salesData = getMockData('salesData');
      setRawSalesData(salesData.data);
      
      const userMetricsData = getMockData('userMetrics');
      setRawUserMetricsData(userMetricsData.data);
      
      // Create a mapping of products to months based on sales data
      // This will help us filter user metrics by product
      const prodMonthMap = {};
      salesData.data.forEach(item => {
        if (!prodMonthMap[item.product]) {
          prodMonthMap[item.product] = new Set();
        }
        prodMonthMap[item.product].add(item.month);
      });
      
      // Convert Sets to arrays
      const finalMap = {};
      Object.keys(prodMonthMap).forEach(product => {
        finalMap[product] = Array.from(prodMonthMap[product]);
      });
      
      setProductMonthMap(finalMap);
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      const activeTabConfig = dashboardConfig.tabs.find(tab => tab.id === activeTab);
      if (!activeTabConfig) return;

      const sourceKeys = new Set();
      activeTabConfig.widgets.forEach(widget => {
        if (widget.sourceKey) {
          sourceKeys.add(widget.sourceKey);
        }
      });

      sourceKeys.forEach(async (sourceKey) => {
        try {
          setLoading(prev => ({ ...prev, [sourceKey]: true }));

          let data;
          if (USE_MOCK_DATA) {
            // Handle special data sources that use aggregated data
            if (sourceKey === 'salesByProduct' || sourceKey === 'salesByMonth') {
              // Apply filters to raw data first
              let filteredRawData = [...rawSalesData];
              
              // Apply interaction filters to raw data
              if (interactionFilters.salesData) {
                filteredRawData = filteredRawData.filter(item => {
                  for (const [key, value] of Object.entries(interactionFilters.salesData)) {
                    if (item[key] !== value) return false;
                  }
                  return true;
                });
              }
              
              // Re-aggregate the filtered data
              if (sourceKey === 'salesByProduct') {
                // Aggregate by product
                const productSummary = {};
                filteredRawData.forEach(item => {
                  if (!productSummary[item.product]) {
                    productSummary[item.product] = { product: item.product, sales: 0, revenue: 0 };
                  }
                  productSummary[item.product].sales += item.sales;
                  productSummary[item.product].revenue += item.revenue;
                });
                data = { data: Object.values(productSummary) };
              } else if (sourceKey === 'salesByMonth') {
                // Aggregate by month
                const monthSummary = {};
                filteredRawData.forEach(item => {
                  if (!monthSummary[item.month]) {
                    monthSummary[item.month] = { month: item.month, sales: 0, revenue: 0 };
                  }
                  monthSummary[item.month].sales += item.sales;
                  monthSummary[item.month].revenue += item.revenue;
                });
                data = { 
                  data: Object.values(monthSummary).sort((a, b) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months.indexOf(a.month) - months.indexOf(b.month);
                  })
                };
              }
            } else if (sourceKey === 'userMetrics') {
              // Filter user metrics data based on filters
              let filteredUserData = [...rawUserMetricsData];
              
              if (interactionFilters.salesData) {
                // Direct month filter
                if (interactionFilters.salesData.month) {
                  filteredUserData = filteredUserData.filter(item => 
                    item.month === interactionFilters.salesData.month
                  );
                }
                
                // Product filter - we need to map product to months
                if (interactionFilters.salesData.product && productMonthMap[interactionFilters.salesData.product]) {
                  // Get months associated with this product
                  const relevantMonths = productMonthMap[interactionFilters.salesData.product];
                  filteredUserData = filteredUserData.filter(item => 
                    relevantMonths.includes(item.month)
                  );
                }
              }
              
              data = { data: filteredUserData };
            } else {
              data = getMockData(sourceKey);
            }
          } else {
            data = await fetchDataSource(sourceKey, filters);
          }

          setDataSources(prev => ({
            ...prev,
            [sourceKey]: data
          }));
        } catch (error) {
          console.error(`Error fetching ${sourceKey}:`, error);
        } finally {
          setLoading(prev => ({ ...prev, [sourceKey]: false }));
        }
      });
    };

    fetchAllData();
  }, [filters, activeTab, interactionFilters, rawSalesData, rawUserMetricsData, productMonthMap]);

  const updateFilter = useCallback((filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);

  const handleInteraction = useCallback((sourceComponent, interactionType, filterKey, value) => {
    console.log(`Handling interaction from ${sourceComponent}: ${interactionType}, ${filterKey}=${value}`);

    // Find the widget that triggered the interaction
    let sourceWidget = null;
    dashboardConfig.tabs.forEach(tab => {
      tab.widgets.forEach(widget => {
        if (widget.id === sourceComponent) {
          sourceWidget = widget;
        }
      });
    });

    if (sourceWidget && sourceWidget.interactions?.onClick) {
      const { targetComponents } = sourceWidget.interactions.onClick;

      // Always update the salesData filter since it's our raw data source
      setInteractionFilters(prev => ({
        ...prev,
        salesData: {
          ...prev?.salesData,
          [filterKey]: value
        }
      }));
    }
  }, []);

  const clearInteractionFilters = useCallback(() => {
    setInteractionFilters({});
  }, []);

  const value = {
    dashboardConfig,
    filters,
    updateFilter,
    dataSources,
    loading,
    activeTab,
    setActiveTab,
    handleInteraction,
    clearInteractionFilters,
    interactionFilters
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};