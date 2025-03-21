import React, { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { useDashboard } from '../../context/DashboardContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const AGGridWidget = ({ id, title, sourceKey, agGridOptions, interactions }) => {
  const { dataSources, loading, handleInteraction, interactionFilters } = useDashboard();

  const onRowSelected = useCallback((event) => {
    if (interactions?.onRowSelected && event.node.isSelected()) {
      const { type, filterKey, targetComponents } = interactions.onRowSelected;
      if (type === 'filter' && filterKey) {
        handleInteraction(id, type, filterKey, event.data[filterKey]);
      }
    }
  }, [id, interactions, handleInteraction]);

  if (loading[sourceKey]) {
    return <div>Loading...</div>;
  }

  const rowData = dataSources[sourceKey]?.data || [];
  
  // Check if this grid is affected by filters
  const hasActiveFilters = interactionFilters && Object.keys(interactionFilters.salesData || {}).length > 0;
  const isAffectedByFilters = hasActiveFilters && sourceKey === 'userMetrics';
  
  // Create a string representation of active filters
  let activeFiltersText = '';
  if (isAffectedByFilters) {
    activeFiltersText = Object.entries(interactionFilters.salesData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  // Debug info
  console.log(`Rendering grid ${id} with data:`, rowData);
  console.log(`Grid interactions:`, interactions);

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
      </div>
      <div className="ag-theme-alpine-dark" style={{ height: 'calc(100% - 40px)', width: '100%' }}>
        <AgGridReact
          {...agGridOptions}
          rowData={rowData}
          onRowSelected={onRowSelected}
          modules={[ClientSideRowModelModule]}
          pagination={true}
          paginationPageSize={5}
          defaultColDef={{
            ...agGridOptions.defaultColDef,
            cellStyle: { color: 'var(--text-color)' }
          }}
        />
      </div>
    </div>
  );
};

export default AGGridWidget;