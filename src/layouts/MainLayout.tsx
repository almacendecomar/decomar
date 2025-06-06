import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import { useTheme } from '../context/ThemeContext';

const MainLayout: React.FC = () => {
  const { isOfflineMode } = useTheme();
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        {isOfflineMode && (
          <div className="bg-amber-500 text-white px-4 py-1 text-center text-sm font-medium">
            Modo sin conexión activo - Todos los datos se almacenan localmente
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;