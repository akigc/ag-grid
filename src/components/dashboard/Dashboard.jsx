import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import AgChartWidget from '../widgets/AgChartWidget';
import AGGridWidget from '../widgets/AGGridWidget';
import GlobalFilters from './GlobalFilters';
import './Dashboard.css';

const WIDGET_TYPES = {
  AgChart: AgChartWidget,
  AGGrid: AGGridWidget,
};

const Dashboard = () => {
  const { dashboardConfig, activeTab, setActiveTab } = useDashboard();
  const { tabs, title } = dashboardConfig;
  
  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  
  const renderWidget = (widget) => {
    const WidgetComponent = WIDGET_TYPES[widget.type];
    if (!WidgetComponent) {
      console.error(`Unknown widget type: ${widget.type}`);
      return null;
    }
    
    return (
      <div
        key={widget.id}
        className="widget-container"
        style={{
          gridColumn: `span ${widget.layout.w}`,
          gridRow: `span ${widget.layout.h}`,
        }}
      >
        <WidgetComponent {...widget} />
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{title}</h1>
        <p className="dashboard-subtitle">Interactive Sales Analytics Dashboard</p>
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label || tab.title}
            </button>
          ))}
        </div>
      </header>
      
      <GlobalFilters />
      
      {activeTabConfig?.widgets.length > 0 ? (
        <div className="widgets-grid">
          {activeTabConfig.widgets.map(renderWidget)}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Welcome to {title}</h2>
          <p>Select a tab to view different analytics and insights</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;