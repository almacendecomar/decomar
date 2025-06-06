import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, GripVertical } from 'lucide-react';
import { Budget } from '../../types';
import Button from '../../components/ui/Button';

const BudgetEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    if (id) {
      loadBudget();
    }
  }, [id]);

  const loadBudget = async () => {
    try {
      const data = await window.database.getBudgetById(id!);
      setBudget(data);
      // TODO: Load budget structure
    } catch (error) {
      console.error('Failed to load budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChapter = () => {
    const newChapter = {
      id: `temp-${Date.now()}`,
      number: `${chapters.length + 1}`,
      title: 'Nuevo capítulo',
      subchapters: [],
    };
    setChapters([...chapters, newChapter]);
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
            onClick={() => navigate(`/budgets/${budget.id}`)}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Editar: {budget.number}</h1>
            <p className="text-gray-600">{budget.project_name} - {budget.client_name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={Save}
            onClick={() => {
              // TODO: Save budget structure
              console.log('Save budget');
            }}
          >
            Guardar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Estructura del presupuesto</h2>
            <Button icon={Plus} onClick={addChapter}>
              Añadir capítulo
            </Button>
          </div>
        </div>

        <div className="p-6">
          {chapters.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-4">No hay capítulos en este presupuesto</p>
              <Button icon={Plus} onClick={addChapter}>
                Añadir primer capítulo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <ChapterEditor
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  onUpdate={(updatedChapter) => {
                    const newChapters = [...chapters];
                    newChapters[index] = updatedChapter;
                    setChapters(newChapters);
                  }}
                  onDelete={() => {
                    setChapters(chapters.filter((_, i) => i !== index));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChapterEditor: React.FC<{
  chapter: any;
  index: number;
  onUpdate: (chapter: any) => void;
  onDelete: () => void;
}> = ({ chapter, index, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addSubchapter = () => {
    const newSubchapter = {
      id: `temp-sub-${Date.now()}`,
      number: `${chapter.number}.${(chapter.subchapters?.length || 0) + 1}`,
      title: 'Nuevo subcapítulo',
      items: [],
    };
    onUpdate({
      ...chapter,
      subchapters: [...(chapter.subchapters || []), newSubchapter],
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <GripVertical size={16} className="text-gray-400 cursor-move" />
          <input
            type="text"
            value={chapter.number}
            onChange={(e) => onUpdate({ ...chapter, number: e.target.value })}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <input
            type="text"
            value={chapter.title}
            onChange={(e) => onUpdate({ ...chapter, title: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
            placeholder="Título del capítulo"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={addSubchapter}
          >
            Subcapítulo
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={onDelete}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {(!chapter.subchapters || chapter.subchapters.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No hay subcapítulos en este capítulo</p>
              <Button size="sm" icon={Plus} onClick={addSubchapter}>
                Añadir subcapítulo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {chapter.subchapters.map((subchapter, subIndex) => (
                <SubchapterEditor
                  key={subchapter.id}
                  subchapter={subchapter}
                  onUpdate={(updatedSubchapter) => {
                    const newSubchapters = [...chapter.subchapters];
                    newSubchapters[subIndex] = updatedSubchapter;
                    onUpdate({ ...chapter, subchapters: newSubchapters });
                  }}
                  onDelete={() => {
                    const newSubchapters = chapter.subchapters.filter((_, i) => i !== subIndex);
                    onUpdate({ ...chapter, subchapters: newSubchapters });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SubchapterEditor: React.FC<{
  subchapter: any;
  onUpdate: (subchapter: any) => void;
  onDelete: () => void;
}> = ({ subchapter, onUpdate, onDelete }) => {
  const addItem = () => {
    const newItem = {
      id: `temp-item-${Date.now()}`,
      number: `${subchapter.number}.${(subchapter.items?.length || 0) + 1}`,
      description: 'Nueva partida',
      quantity: 1,
      purchase_price: 0,
      margin_percentage: 20,
    };
    onUpdate({
      ...subchapter,
      items: [...(subchapter.items || []), newItem],
    });
  };

  return (
    <div className="border border-gray-200 rounded bg-white">
      <div className="p-3 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <GripVertical size={14} className="text-gray-400 cursor-move" />
          <input
            type="text"
            value={subchapter.number}
            onChange={(e) => onUpdate({ ...subchapter, number: e.target.value })}
            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <input
            type="text"
            value={subchapter.title}
            onChange={(e) => onUpdate({ ...subchapter, title: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="Título del subcapítulo"
          />
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={addItem}
          >
            Partida
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={onDelete}
          />
        </div>
      </div>

      {(!subchapter.items || subchapter.items.length === 0) ? (
        <div className="p-6 text-center text-gray-500">
          <p className="mb-2">No hay partidas en este subcapítulo</p>
          <Button size="sm" icon={Plus} onClick={addItem}>
            Añadir partida
          </Button>
        </div>
      ) : (
        <div className="p-3">
          <div className="space-y-2">
            {subchapter.items.map((item, itemIndex) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded">
                <div className="col-span-1">
                  <input
                    type="text"
                    value={item.number}
                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                    readOnly
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...subchapter.items];
                      newItems[itemIndex] = { ...item, description: e.target.value };
                      onUpdate({ ...subchapter, items: newItems });
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Descripción"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...subchapter.items];
                      newItems[itemIndex] = { ...item, quantity: parseFloat(e.target.value) || 0 };
                      onUpdate({ ...subchapter, items: newItems });
                    }}
                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.purchase_price}
                    onChange={(e) => {
                      const newItems = [...subchapter.items];
                      newItems[itemIndex] = { ...item, purchase_price: parseFloat(e.target.value) || 0 };
                      onUpdate({ ...subchapter, items: newItems });
                    }}
                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                    step="0.01"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={item.margin_percentage}
                    onChange={(e) => {
                      const newItems = [...subchapter.items];
                      newItems[itemIndex] = { ...item, margin_percentage: parseFloat(e.target.value) || 0 };
                      onUpdate({ ...subchapter, items: newItems });
                    }}
                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2 text-right text-sm font-medium">
                  {((item.purchase_price * (1 + item.margin_percentage / 100)) * item.quantity).toFixed(2)} €
                </div>
                <div className="col-span-1 text-center">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => {
                      const newItems = subchapter.items.filter((_, i) => i !== itemIndex);
                      onUpdate({ ...subchapter, items: newItems });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetEditor;