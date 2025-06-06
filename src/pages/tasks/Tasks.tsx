import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, CheckSquare, Clock, User } from 'lucide-react';
import { Task, Project } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    status: 'pending' as const,
    assigned_to: '',
    due_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        window.database.getTasks(),
        window.database.getProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.database.createTask(formData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    try {
      await window.database.updateTask({ ...editingTask, ...formData });
      await loadData();
      setEditingTask(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la tarea "${task.title}"?`)) {
      try {
        await window.database.deleteTask(task.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      await window.database.updateTask({ ...task, status: newStatus });
      await loadData();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      title: '',
      description: '',
      status: 'pending',
      assigned_to: '',
      due_date: '',
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      project_id: task.project_id || '',
      title: task.title,
      description: task.description || '',
      status: task.status,
      assigned_to: task.assigned_to || '',
      due_date: task.due_date || '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tasksByStatus = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
    cancelled: filteredTasks.filter(task => task.status === 'cancelled'),
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => openEditModal(task)}
            className="text-gray-400 hover:text-gray-600"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteTask(task)}
            className="text-gray-400 hover:text-red-600"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}
      
      <div className="space-y-2">
        {task.project_name && (
          <div className="flex items-center text-sm text-gray-500">
            <CheckSquare size={14} className="mr-2" />
            {task.project_name}
          </div>
        )}
        
        {task.assigned_to && (
          <div className="flex items-center text-sm text-gray-500">
            <User size={14} className="mr-2" />
            {task.assigned_to}
          </div>
        )}
        
        {task.due_date && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={14} className="mr-2" />
            {new Date(task.due_date).toLocaleDateString('es-ES')}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task, e.target.value as Task['status'])}
          className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}
        >
          <option value="pending">Pendiente</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        
        <span className="text-xs text-gray-400">
          {new Date(task.created_at).toLocaleDateString('es-ES')}
        </span>
      </div>
    </div>
  );

  const TaskForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Obra
          </label>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="">Sin obra asociada</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client_name}
              </option>
            ))}
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
            Asignado a
          </label>
          <input
            type="text"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha límite
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              setEditingTask(null);
            } else {
              setShowCreateModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Tarea
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Tareas</h1>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Nueva Tarea
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Pendientes</h2>
            <span className="bg-amber-100 text-amber-800 text-sm px-2 py-1 rounded-full">
              {tasksByStatus.pending.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.pending.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasksByStatus.pending.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay tareas pendientes</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">En progreso</h2>
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {tasksByStatus.in_progress.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.in_progress.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasksByStatus.in_progress.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay tareas en progreso</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Completadas</h2>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {tasksByStatus.completed.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.completed.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasksByStatus.completed.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay tareas completadas</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Canceladas</h2>
            <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
              {tasksByStatus.cancelled.length}
            </span>
          </div>
          <div className="space-y-3">
            {tasksByStatus.cancelled.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasksByStatus.cancelled.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay tareas canceladas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nueva Tarea"
        size="lg"
      >
        <TaskForm onSubmit={handleCreateTask} isEditing={false} />
      </Modal>

      <Modal
        isOpen={!!editingTask}
        onClose={() => {
          setEditingTask(null);
          resetForm();
        }}
        title="Editar Tarea"
        size="lg"
      >
        <TaskForm onSubmit={handleUpdateTask} isEditing={true} />
      </Modal>
    </div>
  );
};

export default Tasks;