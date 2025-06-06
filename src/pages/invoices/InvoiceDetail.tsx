import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Send, Plus } from 'lucide-react';
import { Invoice } from '../../types';
import Button from '../../components/ui/Button';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      const data = await window.database.getInvoiceById(id!);
      setInvoice(data);
    } catch (error) {
      console.error('Failed to load invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-amber-100 text-amber-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'Emitida';
      case 'sent': return 'Enviada';
      case 'paid': return 'Pagada';
      case 'overdue': return 'Vencida';
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

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Factura no encontrada</h2>
        <p className="text-gray-600 mb-4">La factura que buscas no existe o ha sido eliminada.</p>
        <Button onClick={() => navigate('/invoices')}>
          Volver a facturas
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
            onClick={() => navigate('/invoices')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{invoice.number}</h1>
            <p className="text-gray-600">{invoice.project_name} - {invoice.client_name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(invoice.status)}`}>
            {getStatusText(invoice.status)}
          </span>
          <Button
            variant="secondary"
            icon={Send}
            onClick={() => {
              // TODO: Implement send invoice
              console.log('Send invoice');
            }}
          >
            Enviar factura
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => {
              // TODO: Implement PDF export
              console.log('Export invoice to PDF');
            }}
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Líneas de factura</h2>
            
            <div className="text-center py-12 text-gray-500">
              <Plus size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">Factura vacía</p>
              <p className="mb-4">Comienza añadiendo líneas a tu factura</p>
              <Button
                icon={Plus}
                onClick={() => {
                  // TODO: Add invoice items
                  console.log('Add invoice items');
                }}
              >
                Añadir líneas
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información general</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de emisión</label>
                <p className="text-gray-900">{new Date(invoice.date).toLocaleDateString('es-ES')}</p>
              </div>
              
              {invoice.due_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de vencimiento</label>
                  <p className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString('es-ES')}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">IVA</label>
                <p className="text-gray-900">{invoice.vat_rate}%</p>
              </div>
              
              {invoice.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notas</label>
                  <p className="text-gray-900">{invoice.notes}</p>
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
                <span className="text-gray-600">IVA ({invoice.vat_rate}%):</span>
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
                  // TODO: Implement duplicate invoice
                  console.log('Duplicate invoice');
                }}
              >
                Duplicar factura
              </Button>
              
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  // TODO: Mark as paid
                  console.log('Mark as paid');
                }}
              >
                Marcar como pagada
              </Button>
              
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
                    // TODO: Implement delete invoice
                    console.log('Delete invoice');
                  }
                }}
              >
                Eliminar factura
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;