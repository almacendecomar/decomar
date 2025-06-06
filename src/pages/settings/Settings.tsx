import React, { useState, useEffect } from 'react';
import { 
  Building, User, Palette, Database, Globe,
  Save, Upload, Download, Trash2, Camera, CheckCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Settings: React.FC = () => {
  const { themeColor, setThemeColor } = useTheme();
  
  const [settings, setSettings] = useState({
    company_name: '',
    company_tax_id: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    default_vat: 21,
    default_margin: 20,
    export_path: '',
    language: 'es',
  });
  
  const [logo, setLogo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await window.database.getSettings();
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleThemeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setThemeColor(value);
    setSettings((prev) => ({
      ...prev,
      theme_color: value,
    }));
  };
  
  const handleExportPathSelect = async () => {
    try {
      const path = await window.electron.selectDirectory();
      if (path) {
        setSettings((prev) => ({
          ...prev,
          export_path: path,
        }));
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };
  
  const handleBackupDatabase = async () => {
    try {
      const path = await window.electron.backupDatabase({
        defaultPath: `DECOPRES_backup_${new Date().toISOString().split('T')[0]}.db`,
      });
      
      if (path) {
        alert(`Base de datos guardada correctamente en: ${path}`);
      }
    } catch (error) {
      console.error('Failed to backup database:', error);
      alert('Error al realizar la copia de seguridad.');
    }
  };
  
  const handleRestoreDatabase = async () => {
    if (window.confirm('¿Está seguro de que desea restaurar la base de datos? Esta acción reemplazará todos los datos actuales.')) {
      try {
        const path = await window.electron.restoreDatabase();
        
        if (path) {
          alert(`Base de datos restaurada correctamente desde: ${path}`);
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to restore database:', error);
        alert('Error al restaurar la base de datos.');
      }
    }
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      // Update settings in database
      await window.database.updateSettings({
        ...settings,
        theme_color: themeColor,
      });
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Error al guardar la configuración.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const themeColors = [
    '#2563eb', // Blue
    '#16a34a', // Green
    '#ea580c', // Orange
    '#dc2626', // Red
    '#9333ea', // Purple
    '#0891b2', // Cyan
    '#4f46e5', // Indigo
    '#0f766e', // Teal
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800">Configuración</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company information */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Building size={20} className="mr-2" />
                Información de la empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la empresa
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={settings.company_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="company_tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                    CIF/NIF
                  </label>
                  <input
                    type="text"
                    id="company_tax_id"
                    name="company_tax_id"
                    value={settings.company_tax_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="company_address"
                    name="company_address"
                    value={settings.company_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="company_email"
                    name="company_email"
                    value={settings.company_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="company_phone"
                    name="company_phone"
                    value={settings.company_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Valores predeterminados
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="default_vat" className="block text-sm font-medium text-gray-700 mb-1">
                    IVA predeterminado (%)
                  </label>
                  <input
                    type="number"
                    id="default_vat"
                    name="default_vat"
                    value={settings.default_vat}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="default_margin" className="block text-sm font-medium text-gray-700 mb-1">
                    Margen predeterminado (%)
                  </label>
                  <input
                    type="number"
                    id="default_margin"
                    name="default_margin"
                    value={settings.default_margin}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Globe size={20} className="mr-2" />
                Idioma y región
              </h2>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <select
                  id="language"
                  name="language"
                  value={settings.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="ca">Català</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Palette size={20} className="mr-2" />
                Personalización
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color del tema
                </label>
                <div className="flex space-x-2 mb-4">
                  {themeColors.map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="theme_color"
                        value={color}
                        checked={themeColor === color}
                        onChange={handleThemeColorChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-8 h-8 rounded-full ${
                          themeColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      ></div>
                    </label>
                  ))}
                  
                  <label className="cursor-pointer">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={handleThemeColorChange}
                      className="sr-only"
                    />
                    <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500">
                      <span>+</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="export_path" className="block text-sm font-medium text-gray-700 mb-1">
                  Carpeta de exportación por defecto
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="export_path"
                    name="export_path"
                    value={settings.export_path}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleExportPathSelect}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Explorar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logo and database management */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Camera size={20} className="mr-2" />
                Logo de la empresa
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {logo ? (
                  <div className="mb-4">
                    <img
                      src={logo}
                      alt="Logo de la empresa"
                      className="max-h-32 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="mb-4 text-gray-500">
                    <Building size={64} className="mx-auto mb-2" />
                    <p>No hay logo cargado</p>
                  </div>
                )}
                
                <label className="inline-block px-4 py-2 bg-primary-color text-white rounded-md cursor-pointer hover:bg-primary-dark transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                  {logo ? 'Cambiar logo' : 'Cargar logo'}
                </label>
                
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo(null)}
                    className="ml-2 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Database size={20} className="mr-2" />
                Gestión de datos
              </h2>
              
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleBackupDatabase}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download size={18} className="mr-2" />
                  Crear copia de seguridad
                </button>
                
                <button
                  type="button"
                  onClick={handleRestoreDatabase}
                  className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center"
                >
                  <Upload size={18} className="mr-2" />
                  Restaurar copia de seguridad
                </button>
                
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  onClick={() => {
                    if (window.confirm('¿Está seguro de que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
                      // Implement data reset
                    }
                  }}
                >
                  <Trash2 size={18} className="mr-2" />
                  Eliminar todos los datos
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save button */}
        <div className="border-t border-gray-200 pt-6 mt-6 flex items-center justify-end">
          {saveSuccess && (
            <div className="mr-4 text-green-600 flex items-center">
              <CheckCircle size={16} className="mr-1" />
              <span>Configuración guardada correctamente</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-primary-color text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;