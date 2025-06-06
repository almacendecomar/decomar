import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, FileText, Download } from 'lucide-react';
import { Budget, Project } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Budgets: React.FC = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'draft' as const,
    notes: '',
    default_margin: 20,
    default_vat: 21,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetsData, projectsData] = await Promise.all([
        window.database.getBudgets(),
        window.database.getProjects(),
      ]);
      setBudgets(budgetsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBudgetNumber = () => {
    const year = new Date().getFullYear();
    const count = budgets.filter(b => b.number.includes(year.toString())).length + 1;
    return `P-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...formData,
        number: formData.number || generateBudgetNumber(),
      };
      await window.database.createBudget(budgetData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    
    try {
      await window.database.updateBudget({ ...editingBudget, ...formData });
      await loadData();
      setEditingBudget(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  const handleDeleteBudget = async (budget: Budget) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el presupuesto "${budget.number}"?`)) {
      try {
        await window.database.deleteBudget(budget.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      project_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: '',
      default_margin: 20,
      default_vat: 21,
    });
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      number: budget.number,
      project_id: budget.project_id,
      date: budget.date,
      status: budget.status,
      notes: budget.notes || '',
      default_margin: budget.default_margin || 20,
      default_vat: budget.default_vat || 21,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'number',
      title: 'Número',
      render: (value: string, record: Budget) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString('es-ES')}</div>
        </div>
      ),
    },
    {
      key: 'project_name',
      title: 'Obra',
      render: (value: string, record: Budget) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{record.client_name}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Estado',
      render: (value: string) => (
        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      ),
    },
    {
      key: 'default_margin',
      title: 'Margen (%)',
      render: (value: number) => `${value || 0}%`,
    },
    {
      key: 'default_vat',
      title: 'IVA (%)',
      render: (value: number) => `${value || 0}%`,
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (value: any, record: Budget) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/budgets/${record.id}`);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/budgets/${record.id}/edit`);
            }}
            className="text-purple-600 hover:text-purple-800"
            title="Editar presupuesto"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(record);
            }}
            className="text-green-600 hover:text-green-800"
            title="Editar datos"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBudget(record);
            }}
            className="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '150px',
    },
  ];

  const BudgetForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de presupuesto
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder={generateBudgetNumber()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Dejar vacío para generar automáticamente</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Obra *
          </label>
          <select
            required
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="">Seleccionar obra</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client_name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
            <option value="accepted">Aceptado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Margen por defecto (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.default_margin}
            onChange={(e) => setFormData({ ...formData, default_margin: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IVA por defecto (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.default_vat}
            onChange={(e) => setFormData({ ...formData, default_vat: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (isEditing) {
              setEditingBudget(null);
            } else {
              setShowCreateModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Presupuesto
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Presupuestos</h1>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Nuevo Presupuesto
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar presupuestos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredBudgets}
        loading={loading}
        onRowClick={(budget) => navigate(`/budgets/${budget.id}`)}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nuevo Presupuesto"
        size="lg"
      >
        <BudgetForm onSubmit={handleCreateBudget} isEditing={false} />
      </Modal>

      <Modal
        isOpen={!!editingBudget}
        onClose={() => {
          setEditingBudget(null);
          resetForm();
        }}
        title="Editar Presupuesto"
        size="lg"
      >
        <BudgetForm onSubmit={handleUpdateBudget} isEditing={true} />
      </Modal>
    </div>
  );
};

export default Budgets;