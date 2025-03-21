import React from 'react';
import { AgCharts } from 'ag-charts-react';
import { useDashboard } from '../../context/DashboardContext';

const AgChartWidget = ({ id, title, sourceKey, chartOptions, interactions }) => {
  const { dataSources, loading, handleInteraction } = useDashboard();
  
  const handleChartClick = (event) => {
    if (interactions?.onClick) {
      const { type, filterKey, targetComponents } = interactions.onClick;
      if (type === 'filter' && filterKey) {
        handleInteraction(id, type, filterKey, event.datum[filterKey]);
      }
    }
  };

  if (loading[sourceKey]) {
    return <div>Loading...</div>;
  }

  const data = dataSources[sourceKey]?.data || [];
  const options = {
    ...chartOptions,
    data,
    theme: {
      overrides: {
        common: {
          title: {
            color: 'var(--text-color)'
          },
          legend: {
            item: {
              label: {
                color: 'var(--text-color)'
              }
            }
          }
        }
      }
    },
    container: {
      events: {
        click: handleChartClick
      }
    }
  };

  return (
    <div className="widget">
      <h3>{title}</h3>
      <div style={{ height: 'calc(100% - 40px)', width: '100%' }}>
        <AgCharts options={options} />
      </div>
    </div>
  );
};

export default AgChartWidget; 