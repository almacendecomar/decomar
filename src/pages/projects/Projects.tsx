import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { Project, Client } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    address: '',
    type: '',
    start_date: '',
    expected_end_date: '',
    status: 'pending' as const,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, clientsData] = await Promise.all([
        window.database.getProjects(),
        window.database.getClients(),
      ]);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.database.createProject(formData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    
    try {
      await window.database.updateProject({ ...editingProject, ...formData });
      await loadData();
      setEditingProject(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la obra "${project.name}"?`)) {
      try {
        await window.database.deleteProject(project.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      name: '',
      address: '',
      type: '',
      start_date: '',
      expected_end_date: '',
      status: 'pending',
      notes: '',
    });
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      client_id: project.client_id,
      name: project.name,
      address: project.address || '',
      type: project.type || '',
      start_date: project.start_date || '',
      expected_end_date: project.expected_end_date || '',
      status: project.status,
      notes: project.notes || '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      title: 'Nombre',
      render: (value: string, record: Project) => (
        <div>
          <div className="font-medium">{value}</div>
          {record.address && (
            <div className="text-sm text-gray-500">{record.address}</div>
          )}
        </div>
      ),
    },
    {
      key: 'client_name',
      title: 'Cliente',
    },
    {
      key: 'type',
      title: 'Tipo',
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
      key: 'start_date',
      title: 'Fecha inicio',
      render: (value: string) => value ? new Date(value).toLocaleDateString('es-ES') : '-',
    },
    {
      key: 'expected_end_date',
      title: 'Fecha fin prevista',
      render: (value: string) => value ? new Date(value).toLocaleDateString('es-ES') : '-',
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (value: any, record: Project) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${record.id}`);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(record);
            }}
            className="text-green-600 hover:text-green-800"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProject(record);
            }}
            className="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '120px',
    },
  ];

  const ProjectForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            required
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la obra *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de obra
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="">Seleccionar tipo</option>
            <option value="reforma">Reforma</option>
            <option value="nueva_construccion">Nueva construcción</option>
            <option value="rehabilitacion">Rehabilitación</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="otros">Otros</option>
          </select>
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
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha fin prevista
          </label>
          <input
            type="date"
            value={formData.expected_end_date}
            onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
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
              setEditingProject(null);
            } else {
              setShowCreateModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Obra
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Obras</h1>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Nueva Obra
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar obras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredProjects}
        loading={loading}
        onRowClick={(project) => navigate(`/projects/${project.id}`)}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nueva Obra"
        size="lg"
      >
        <ProjectForm onSubmit={handleCreateProject} isEditing={false} />
      </Modal>

      <Modal
        isOpen={!!editingProject}
        onClose={() => {
          setEditingProject(null);
          resetForm();
        }}
        title="Editar Obra"
        size="lg"
      >
        <ProjectForm onSubmit={handleUpdateProject} isEditing={true} />
      </Modal>
    </div>
  );
};

export default Projects;