import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, FileText, Receipt, Plus } from 'lucide-react';
import { Project } from '../../types';
import Button from '../../components/ui/Button';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await window.database.getProjectById(id!);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Obra no encontrada</h2>
        <p className="text-gray-600 mb-4">La obra que buscas no existe o ha sido eliminada.</p>
        <Button onClick={() => navigate('/projects')}>
          Volver a obras
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/projects')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{project.name}</h1>
            <p className="text-gray-600">{project.client_name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
          <Button
            variant="secondary"
            icon={Edit}
            onClick={() => {
              // TODO: Open edit modal or navigate to edit page
              console.log('Edit project');
            }}
          >
            Editar obra
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Información de la obra</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900 mt-1">{project.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Cliente</label>
                <p className="text-gray-900 mt-1">{project.client_name}</p>
              </div>
              
              {project.address && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-gray-900 mt-1">{project.address}</p>
                </div>
              )}
              
              {project.type && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de obra</label>
                  <p className="text-gray-900 mt-1">{project.type}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </p>
              </div>
              
              {project.start_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de inicio</label>
                  <p className="text-gray-900 mt-1">{new Date(project.start_date).toLocaleDateString('es-ES')}</p>
                </div>
              )}
              
              {project.expected_end_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha fin prevista</label>
                  <p className="text-gray-900 mt-1">{new Date(project.expected_end_date).toLocaleDateString('es-ES')}</p>
                </div>
              )}
              
              {project.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Notas</label>
                  <p className="text-gray-900 mt-1">{project.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones rápidas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="secondary"
                icon={FileText}
                className="w-full"
                onClick={() => navigate('/budgets')}
              >
                Crear presupuesto
              </Button>
              
              <Button
                variant="secondary"
                icon={Receipt}
                className="w-full"
                onClick={() => navigate('/invoices')}
              >
                Crear factura
              </Button>
              
              <Button
                variant="secondary"
                icon={Calendar}
                className="w-full"
                onClick={() => navigate('/calendar')}
              >
                Programar evento
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Presupuestos</h3>
            
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No hay presupuestos para esta obra</p>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => navigate('/budgets')}
              >
                Crear presupuesto
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Facturas</h3>
            
            <div className="text-center py-8 text-gray-500">
              <Receipt size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No hay facturas para esta obra</p>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => navigate('/invoices')}
              >
                Crear factura
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximos eventos</h3>
            
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No hay eventos programados</p>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => navigate('/calendar')}
              >
                Programar evento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;