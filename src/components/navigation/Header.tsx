import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Settings, User, LogOut, 
  Wifi, WifiOff, Moon, Sun
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOfflineMode, toggleOfflineMode } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/clients')) return 'Clientes';
    if (path.startsWith('/projects')) return 'Obras';
    if (path.startsWith('/budgets')) return 'Presupuestos';
    if (path.startsWith('/invoices')) return 'Facturas';
    if (path.startsWith('/calendar')) return 'Agenda';
    if (path.startsWith('/materials')) return 'Materiales';
    if (path.startsWith('/suppliers')) return 'Proveedores';
    if (path.startsWith('/tasks')) return 'Tareas';
    if (path.startsWith('/settings')) return 'Configuración';
    
    return 'DECOPRES';
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement global search functionality
    console.log('Searching for:', searchText);
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Implement dark mode toggle
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </form>
          
          {/* Online/Offline toggle */}
          <button
            onClick={toggleOfflineMode}
            className={`p-2 rounded-full ${isOfflineMode ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}
            title={isOfflineMode ? 'Modo sin conexión activado' : 'Modo con conexión activado'}
          >
            {isOfflineMode ? <WifiOff size={20} /> : <Wifi size={20} />}
          </button>
          
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 text-gray-600"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Notifications */}
          <button className="p-2 rounded-full bg-gray-100 text-gray-600 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              2
            </span>
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-color flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div className="hidden md:block text-sm text-gray-700">Admin</div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;