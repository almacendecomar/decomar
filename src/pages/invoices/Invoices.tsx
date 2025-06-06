import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Send, Download } from 'lucide-react';
import { Invoice, Project } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'issued' as const,
    notes: '',
    vat_rate: 21,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, projectsData] = await Promise.all([
        window.database.getInvoices(),
        window.database.getProjects(),
      ]);
      setInvoices(invoicesData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.filter(i => i.number.includes(year.toString())).length + 1;
    return `F-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        number: formData.number || generateInvoiceNumber(),
      };
      await window.database.createInvoice(invoiceData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    
    try {
      await window.database.updateInvoice({ ...editingInvoice, ...formData });
      await loadData();
      setEditingInvoice(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update invoice:', error);
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la factura "${invoice.number}"?`)) {
      try {
        await window.database.deleteInvoice(invoice.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      project_id: '',
      date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'issued',
      notes: '',
      vat_rate: 21,
    });
  };

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      number: invoice.number,
      project_id: invoice.project_id,
      date: invoice.date,
      due_date: invoice.due_date || '',
      status: invoice.status,
      notes: invoice.notes || '',
      vat_rate: invoice.vat_rate,
    });
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

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'number',
      title: 'Número',
      render: (value: string, record: Invoice) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString('es-ES')}</div>
        </div>
      ),
    },
    {
      key: 'project_name',
      title: 'Obra',
      render: (value: string, record: Invoice) => (
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
      key: 'due_date',
      title: 'Vencimiento',
      render: (value: string) => value ? new Date(value).toLocaleDateString('es-ES') : '-',
    },
    {
      key: 'vat_rate',
      title: 'IVA (%)',
      render: (value: number) => `${value}%`,
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (value: any, record: Invoice) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/invoices/${record.id}`);
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
              // TODO: Send invoice
              console.log('Send invoice');
            }}
            className="text-purple-600 hover:text-purple-800"
            title="Enviar"
          >
            <Send size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteInvoice(record);
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

  const InvoiceForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de factura
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder={generateInvoiceNumber()}
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
            Fecha de emisión
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
            Fecha de vencimiento
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
            <option value="issued">Emitida</option>
            <option value="sent">Enviada</option>
            <option value="paid">Pagada</option>
            <option value="overdue">Vencida</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IVA (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.vat_rate}
            onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) })}
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
              setEditingInvoice(null);
            } else {
              setShowCreateModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Factura
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Facturas</h1>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Nueva Factura
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar facturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredInvoices}
        loading={loading}
        onRowClick={(invoice) => navigate(`/invoices/${invoice.id}`)}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nueva Factura"
        size="lg"
      >
        <InvoiceForm onSubmit={handleCreateInvoice} isEditing={false} />
      </Modal>

      <Modal
        isOpen={!!editingInvoice}
        onClose={() => {
          setEditingInvoice(null);
          resetForm();
        }}
        title="Editar Factura"
        size="lg"
      >
        <InvoiceForm onSubmit={handleUpdateInvoice} isEditing={true} />
      </Modal>
    </div>
  );
};

export default Invoices;