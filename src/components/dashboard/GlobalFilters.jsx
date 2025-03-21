import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import './GlobalFilters.css';

const GlobalFilters = () => {
  const { dashboardConfig, filters, updateFilter, dataSources } = useDashboard();
  const { globalFilters } = dashboardConfig;

  const renderDateRangeFilter = (filter) => {
    const value = filters[filter.id] || filter.default || {};
    
    return (
      <div key={filter.id} className="filter-item">
        <label>{filter.label}</label>
        <div className="date-range-inputs">
          <input
            type="date"
            value={value.from || ''}
            onChange={(e) => updateFilter(filter.id, { ...value, from: e.target.value })}
          />
          <input
            type="date"
            value={value.to || ''}
            onChange={(e) => updateFilter(filter.id, { ...value, to: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderDropdownFilter = (filter) => {
    const value = filters[filter.id] || filter.default || (filter.multi ? [] : '');
    const options = dataSources[filter.optionsSource]?.data || [];
    
    return (
      <div key={filter.id} className="filter-item">
        <label>{filter.label}</label>
        <select
          multiple={filter.multi}
          value={value}
          onChange={(e) => {
            const selectedValues = filter.multi
              ? Array.from(e.target.selectedOptions, option => option.value)
              : e.target.value;
            updateFilter(filter.id, selectedValues);
          }}
        >
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'dateRange':
        return renderDateRangeFilter(filter);
      case 'dropdown':
        return renderDropdownFilter(filter);
      default:
        return null;
    }
  };

  return (
    <div className="global-filters">
      {globalFilters.map(renderFilter)}
    </div>
  );
};

export default GlobalFilters; 