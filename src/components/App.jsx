import React from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import Dashboard from './dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}

export default App; 