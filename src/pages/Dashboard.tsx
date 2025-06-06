import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Receipt, Users, Briefcase, 
  ArrowUpRight, ArrowDownRight, DollarSign, Clock,
  Plus
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    totalBudgets: 0,
    pendingBudgets: 0,
    acceptedBudgets: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
  });
  
  const [recentBudgets, setRecentBudgets] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  useEffect(() => {
    // In a real app, this would fetch data from the database
    // For demo purposes, we're using placeholder data
    setStats({
      totalClients: 12,
      totalProjects: 8,
      totalBudgets: 24,
      pendingBudgets: 5,
      acceptedBudgets: 15,
      totalInvoices: 18,
      pendingInvoices: 3,
      paidInvoices: 15,
    });
    
    // Placeholder data for recent budgets
    setRecentBudgets([
      { id: 'b1', number: 'P-2025-001', client: 'Familia García', amount: 12500, status: 'accepted' },
      { id: 'b2', number: 'P-2025-002', client: 'Hotel Marina', amount: 45000, status: 'pending' },
      { id: 'b3', number: 'P-2025-003', client: 'Casa Rural El Pinar', amount: 8900, status: 'draft' },
    ]);
    
    // Placeholder data for recent invoices
    setRecentInvoices([
      { id: 'i1', number: 'F-2025-001', client: 'Familia García', amount: 12500, status: 'paid' },
      { id: 'i2', number: 'F-2025-002', client: 'Hotel Marina', amount: 15000, status: 'pending' },
    ]);
    
    // Placeholder data for upcoming events
    setUpcomingEvents([
      { id: 'e1', title: 'Visita obra Hotel Marina', project: 'Hotel Marina', date: '2025-04-15' },
      { id: 'e2', title: 'Medición Casa Rural', project: 'Casa Rural El Pinar', date: '2025-04-18' },
    ]);
  }, []);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptado';
      case 'rejected': return 'Rechazado';
      case 'paid': return 'Pagado';
      default: return status;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clientes</p>
              <h3 className="text-3xl font-semibold mt-1">{stats.totalClients}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/clients" className="text-sm text-primary-color hover:underline inline-flex items-center">
              Ver todos <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Obras</p>
              <h3 className="text-3xl font-semibold mt-1">{stats.totalProjects}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <Briefcase size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/projects" className="text-sm text-primary-color hover:underline inline-flex items-center">
              Ver todas <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Presupuestos</p>
              <h3 className="text-3xl font-semibold mt-1">{stats.totalBudgets}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FileText size={24} />
            </div>
          </div>
          <div className="mt-2 flex space-x-4 text-sm">
            <div>
              <span className="text-green-600">{stats.acceptedBudgets}</span> aceptados
            </div>
            <div>
              <span className="text-amber-600">{stats.pendingBudgets}</span> pendientes
            </div>
          </div>
          <div className="mt-2">
            <Link to="/budgets" className="text-sm text-primary-color hover:underline inline-flex items-center">
              Ver todos <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Facturas</p>
              <h3 className="text-3xl font-semibold mt-1">{stats.totalInvoices}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Receipt size={24} />
            </div>
          </div>
          <div className="mt-2 flex space-x-4 text-sm">
            <div>
              <span className="text-green-600">{stats.paidInvoices}</span> pagadas
            </div>
            <div>
              <span className="text-amber-600">{stats.pendingInvoices}</span> pendientes
            </div>
          </div>
          <div className="mt-2">
            <Link to="/invoices" className="text-sm text-primary-color hover:underline inline-flex items-center">
              Ver todas <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent budgets */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Presupuestos recientes</h2>
              <Link to="/budgets/new" className="text-sm bg-primary-color text-white px-3 py-1 rounded-md inline-flex items-center">
                <Plus size={16} className="mr-1" />
                Nuevo
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBudgets.map((budget) => (
              <Link to={`/budgets/${budget.id}`} key={budget.id} className="block p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">{budget.number}</div>
                    <div className="text-gray-500">{budget.client}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(budget.amount)}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(budget.status)}`}>
                        {getStatusText(budget.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <Link to="/budgets" className="text-primary-color hover:underline text-sm">
              Ver todos los presupuestos
            </Link>
          </div>
        </div>
        
        {/* Recent invoices */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Facturas recientes</h2>
              <Link to="/invoices/new" className="text-sm bg-primary-color text-white px-3 py-1 rounded-md inline-flex items-center">
                <Plus size={16} className="mr-1" />
                Nueva
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.map((invoice) => (
              <Link to={`/invoices/${invoice.id}`} key={invoice.id} className="block p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">{invoice.number}</div>
                    <div className="text-gray-500">{invoice.client}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(invoice.amount)}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <Link to="/invoices" className="text-primary-color hover:underline text-sm">
              Ver todas las facturas
            </Link>
          </div>
        </div>
      </div>
      
      {/* Upcoming events */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Próximos eventos</h2>
            <Link to="/calendar" className="text-sm bg-primary-color text-white px-3 py-1 rounded-md inline-flex items-center">
              <Plus size={16} className="mr-1" />
              Nuevo
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-4">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-lg font-medium">{event.title}</div>
                  <div className="text-gray-500">{event.project}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 text-center">
          <Link to="/calendar" className="text-primary-color hover:underline text-sm">
            Ver agenda completa
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;