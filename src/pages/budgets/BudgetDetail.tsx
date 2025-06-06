import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, FileText, Plus } from 'lucide-react';
import { Budget } from '../../types';
import Button from '../../components/ui/Button';

const BudgetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBudget();
    }
  }, [id]);

  const loadBudget = async () => {
    try {
      const data = await window.database.getBudgetById(id!);
      setBudget(data);
    } catch (error) {
      console.error('Failed to load budget:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Presupuesto no encontrado</h2>
        <p className="text-gray-600 mb-4">El presupuesto que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => navigate('/budgets')}>
          Volver a presupuestos
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
            onClick={() => navigate('/budgets')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{budget.number}</h1>
            <p className="text-gray-600">{budget.project_name} - {budget.client_name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(budget.status)}`}>
            {getStatusText(budget.status)}
          </span>
          <Button
            variant="secondary"
            icon={Edit}
            onClick={() => navigate(`/budgets/${budget.id}/edit`)}
          >
            Editar presupuesto
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => {
              // TODO: Implement PDF export
              console.log('Export budget to PDF');
            }}
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Estructura del presupuesto</h2>
            
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">Presupuesto vacío</p>
              <p className="mb-4">Comienza añadiendo capítulos y partidas a tu presupuesto</p>
              <Button
                icon={Plus}
                onClick={() => navigate(`/budgets/${budget.id}/edit`)}
              >
                Editar presupuesto
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información general</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha</label>
                <p className="text-gray-900">{new Date(budget.date).toLocaleDateString('es-ES')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Margen por defecto</label>
                <p className="text-gray-900">{budget.default_margin || 0}%</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">IVA por defecto</label>
                <p className="text-gray-900">{budget.default_vat || 0}%</p>
              </div>
              
              {budget.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notas</label>
                  <p className="text-gray-900">{budget.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen económico</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">0,00 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA:</span>
                <span className="font-medium">0,00 €</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>0,00 €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones</h3>
            
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  // TODO: Implement duplicate budget
                  console.log('Duplicate budget');
                }}
              >
                Duplicar presupuesto
              </Button>
              
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  // TODO: Implement create invoice from budget
                  console.log('Create invoice from budget');
                }}
              >
                Crear factura
              </Button>
              
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (window.confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
                    // TODO: Implement delete budget
                    console.log('Delete budget');
                  }
                }}
              >
                Eliminar presupuesto
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetail;