import React, { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useDashboard } from '../../context/DashboardContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const AGGridWidget = ({ id, title, sourceKey, agGridOptions, interactions }) => {
  const { dataSources, loading, handleInteraction } = useDashboard();

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

  return (
    <div className="widget">
      <h3>{title}</h3>
      <div className="ag-theme-alpine-dark" style={{ height: 'calc(100% - 40px)', width: '100%' }}>
        <AgGridReact
          {...agGridOptions}
          rowData={rowData}
          onRowSelected={onRowSelected}
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