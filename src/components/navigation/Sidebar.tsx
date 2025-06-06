import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Layout, Users, Briefcase, FileText, Receipt, 
  Calendar, Package, Truck, CheckSquare, Settings,
  Database, ArrowRightCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Sidebar: React.FC = () => {
  const { themeColor } = useTheme();
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? `bg-primary-color text-white` 
        : `text-gray-700 hover:bg-gray-100`
    }`;
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo and app name */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Layout size={28} style={{ color: themeColor }} />
          <h1 className="text-xl font-bold" style={{ color: themeColor }}>DECOPRES</h1>
        </div>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={navLinkClass} end>
              <Layout size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/clients" className={navLinkClass}>
              <Users size={20} />
              <span>Clientes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={navLinkClass}>
              <Briefcase size={20} />
              <span>Obras</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/budgets" className={navLinkClass}>
              <FileText size={20} />
              <span>Presupuestos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/invoices" className={navLinkClass}>
              <Receipt size={20} />
              <span>Facturas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendar" className={navLinkClass}>
              <Calendar size={20} />
              <span>Agenda</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/materials" className={navLinkClass}>
              <Package size={20} />
              <span>Materiales</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/suppliers" className={navLinkClass}>
              <Truck size={20} />
              <span>Proveedores</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/tasks" className={navLinkClass}>
              <CheckSquare size={20} />
              <span>Tareas</span>
            </NavLink>
          </li>
        </ul>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <ul className="space-y-1">
            <li>
              <NavLink to="/settings" className={navLinkClass}>
                <Settings size={20} />
                <span>Configuración</span>
              </NavLink>
            </li>
            <li>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <Database size={20} />
                <span>Copia de seguridad</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                <ArrowRightCircle size={20} />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;