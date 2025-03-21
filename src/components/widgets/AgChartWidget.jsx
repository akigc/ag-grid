import React, { useEffect, useRef } from 'react';
import { AgCharts } from 'ag-charts-react';
import { useDashboard } from '../../context/DashboardContext';

const AgChartWidget = ({ id, title, sourceKey, agChartOptions, interactions }) => {
  const { dataSources, loading, handleInteraction, interactionFilters, clearInteractionFilters } = useDashboard();
  const chartRef = useRef(null);
  
  const handleChartClick = (event) => {
    console.log('Chart clicked:', event);
    if (interactions?.onClick) {
      const { type, filterKey, targetComponents } = interactions.onClick;
      if (type === 'filter' && filterKey && event.datum) {
        console.log(`Chart clicked: ${id}, Filter: ${filterKey}, Value: ${event.datum[filterKey]}`);
        handleInteraction(id, type, filterKey, event.datum[filterKey]);
      }
    }
  };

  const hasActiveFilters = interactionFilters && Object.keys(interactionFilters.salesData || {}).length > 0;
  
  // Create a string representation of active filters for this chart
  let activeFiltersText = '';
  if (hasActiveFilters) {
    activeFiltersText = Object.entries(interactionFilters.salesData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  if (loading[sourceKey]) {
    return <div>Loading...</div>;
  }

  const data = dataSources[sourceKey]?.data || [];
  
  // Process options to remove any special properties that AG Charts doesn't understand
  const processedOptions = { ...agChartOptions };
  if (processedOptions.series) {
    processedOptions.series = processedOptions.series.map(series => {
      const { aggregated, ...rest } = series;
      return rest;
    });
  }
  
  // Determine if this chart is affected by the filters
  const isAffectedByFilters = hasActiveFilters && (
    // For userMetrics, it's affected by both month and product filters
    (sourceKey === 'userMetrics') || 
    // For salesByMonth, it's affected by product filters
    (sourceKey === 'salesByMonth' && interactionFilters.salesData.product) ||
    // For salesByProduct, it's affected by month filters
    (sourceKey === 'salesByProduct' && interactionFilters.salesData.month)
  );
  
  // Add listeners to each series
  if (processedOptions.series) {
    processedOptions.series.forEach(series => {
      if (!series.listeners) {
        series.listeners = {};
      }
      series.listeners.nodeClick = handleChartClick;
    });
  }
  
  const options = {
    ...processedOptions,
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
    // Add click listener to the chart
    listeners: {
      click: handleChartClick
    }
  };

  // Calculate the header height based on whether we have active filters
  const headerHeight = hasActiveFilters ? 60 : 40;

  // Debug info
  console.log(`Rendering ${id} with data:`, data);
  console.log(`Interactions:`, interactions);
  console.log(`Active filters:`, interactionFilters);

  return (
    <div className="widget">
      <div className="widget-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {isAffectedByFilters && (
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              Filtered by: {activeFiltersText}
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <button 
            className="clear-filters-btn" 
            onClick={clearInteractionFilters}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              color: 'var(--text-color)',
              fontSize: '12px'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
      <div style={{ height: `calc(100% - ${headerHeight}px)`, width: '100%' }}>
        <AgCharts options={options} />
      </div>
    </div>
  );
};

export default AgChartWidget;