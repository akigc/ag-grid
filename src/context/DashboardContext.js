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
  
  useEffect(() => {
    const defaultFilters = {};
    dashboardConfig.globalFilters.forEach(filter => {
      if (filter.default) {
        defaultFilters[filter.id] = filter.default;
      }
    });
    setFilters(defaultFilters);
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
            data = getMockData(sourceKey);
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
  }, [filters, activeTab]);
  
  const updateFilter = useCallback((filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);
  
  const handleInteraction = useCallback((sourceComponent, interactionType, filterKey, value) => {
    dashboardConfig.tabs.forEach(tab => {
      tab.widgets.forEach(widget => {
        if (widget.listeners && 
            widget.listeners.sourceComponent === sourceComponent && 
            widget.listeners.filterKey === filterKey) {
          if (interactionType === 'filter') {
            updateFilter(`${sourceComponent}_${filterKey}`, value);
          }
        }
      });
    });
  }, [updateFilter]);
  
  const value = {
    dashboardConfig,
    filters,
    updateFilter,
    dataSources,
    loading,
    activeTab,
    setActiveTab,
    handleInteraction
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