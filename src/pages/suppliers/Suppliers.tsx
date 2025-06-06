import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Truck } from 'lucide-react';
import { Supplier } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    contact_person: '',
    notes: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await window.database.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.database.createSupplier(formData);
      await loadSuppliers();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    
    try {
      await window.database.updateSupplier({ ...editingSupplier, ...formData });
      await loadSuppliers();
      setEditingSupplier(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el proveedor "${supplier.name}"?`)) {
      try {
        await window.database.deleteSupplier(supplier.id);
        await loadSuppliers();
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tax_id: '',
      address: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      contact_person: '',
      notes: '',
    });
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      tax_id: supplier.tax_id || '',
      address: supplier.address || '',
      city: supplier.city || '',
      postal_code: supplier.postal_code || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      contact_person: supplier.contact_person || '',
      notes: supplier.notes || '',
    });
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.tax_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      title: 'Nombre',
      render: (value: string, record: Supplier) => (
        <div>
          <div className="font-medium">{value}</div>
          {record.contact_person && (
            <div className="text-sm text-gray-500">{record.contact_person}</div>
          )}
        </div>
      ),
    },
    {
      key: 'tax_id',
      title: 'CIF/NIF',
    },
    {
      key: 'email',
      title: 'Email',
    },
    {
      key: 'phone',
      title: 'Teléfono',
    },
    {
      key: 'city',
      title: 'Ciudad',
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (value: any, record: Supplier) => (
        <div className="flex space-x-2">
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
              handleDeleteSupplier(record);
            }}
            className="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '100px',
    },
  ];

  const SupplierForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CIF/NIF
          </label>
          <input
            type="text"
            value={formData.tax_id}
            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
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
            Ciudad
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código postal
          </label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Persona de contacto
          </label>
          <input
            type="text"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
              setEditingSupplier(null);
            } else {
              setShowCreateModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Proveedor
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Proveedores</h1>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Nuevo Proveedor
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredSuppliers}
        loading={loading}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nuevo Proveedor"
        size="lg"
      >
        <SupplierForm onSubmit={handleCreateSupplier} isEditing={false} />
      </Modal>

      <Modal
        isOpen={!!editingSupplier}
        onClose={() => {
          setEditingSupplier(null);
          resetForm();
        }}
        title="Editar Proveedor"
        size="lg"
      >
        <SupplierForm onSubmit={handleUpdateSupplier} isEditing={true} />
      </Modal>
    </div>
  );
};

export default Suppliers;