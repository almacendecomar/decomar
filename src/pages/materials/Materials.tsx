import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Material, Supplier } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    code: '',
    name: '',
    description: '',
    purchase_price: 0,
    unit: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsData, suppliersData] = await Promise.all([
        window.database.getMaterials(),
        window.database.getSuppliers(),
      ]);
      setMaterials(materialsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.database.createMaterial(formData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create material:', error);
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    
    try {
      await window.database.updateMaterial({ ...editingMaterial, ...formData });
      await loadData();
      setEditingMaterial(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update material:', error);
    }
  };

  const handleDeleteMaterial = async (material: Material) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el material "${material.name}"?`)) {
      try {
        await window.database.deleteMaterial(material.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete material:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      code: '',
      name: '',
      description: '',
      purchase_price: 0,
      unit: '',
      notes: '',
    });
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      supplier_id: material.supplier_id || '',
      code: material.code || '',
      name: material.name,
      description: material.description || '',
      purchase_price: material.purchase_price || 0,
      unit: material.unit || '',
      notes: material.notes || '',
    });
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'code',
      title: 'Código',
      render: (value: string) => value || '-',
    },
    {
      key: 'name',
      title: 'Nombre',
      render: (value: string, record: Material) => (
        <div>
          <div className="font-medium">{value}</div>
          {record.description && (
            <div className="text-sm text-gray-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'supplier_name',
      title: 'Proveedor',
      render: (value: string) => value || '-',
    },
    {
      key: 'purchase_price',
      title: 'Precio',
      render: (value: number, record: Material) => (
        <div>
          {value ? `${value.toFixed(2)} €` : '-'}
          {record.unit && <div className="text-sm text-gray-500">por {record.unit}</div>}
        </div>
      ),
    },
    {
      key: 'unit',
      title: 'Unidad',
      render: (value: string) => value || '-',
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (value: any, record: Material) => (
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
              handleDeleteMaterial(record);
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

  const MaterialForm = ({ onSubmit, isEditing }: { onSubmit: (e: React.FormEvent) => void; isEditing: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor
          </label>
          <select
            value={formData.supplier_id}
            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="">Sin proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
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
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio de compra
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad
          </label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="ej: m², kg, ud"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            rows={2}
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
              setEditingMaterial(null);
            } else {
              setShowCreateModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Material
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Materiales</h1>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Nuevo Material
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar materiales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredMaterials}
        loading={loading}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nuevo Material"
        size="lg"
      >
        <MaterialForm onSubmit={handleCreateMaterial} isEditing={false} />
      </Modal>

      <Modal
        isOpen={!!editingMaterial}
        onClose={() => {
          setEditingMaterial(null);
          resetForm();
        }}
        title="Editar Material"
        size="lg"
      >
        <MaterialForm onSubmit={handleUpdateMaterial} isEditing={true} />
      </Modal>
    </div>
  );
};

export default Materials;