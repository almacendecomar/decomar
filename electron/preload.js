import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File system operations
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  openFile: (options) => ipcRenderer.invoke('open-file', options),
  
  // Database operations
  backupDatabase: (options) => ipcRenderer.invoke('backup-database', options),
  restoreDatabase: () => ipcRenderer.invoke('restore-database'),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Window operations
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
});

// Expose database API
contextBridge.exposeInMainWorld('database', {
  // Clients
  getClients: () => ipcRenderer.invoke('db-get-clients'),
  getClientById: (id) => ipcRenderer.invoke('db-get-client', id),
  createClient: (client) => ipcRenderer.invoke('db-create-client', client),
  updateClient: (client) => ipcRenderer.invoke('db-update-client', client),
  deleteClient: (id) => ipcRenderer.invoke('db-delete-client', id),
  
  // Projects
  getProjects: () => ipcRenderer.invoke('db-get-projects'),
  getProjectById: (id) => ipcRenderer.invoke('db-get-project', id),
  getProjectsByClient: (clientId) => ipcRenderer.invoke('db-get-projects-by-client', clientId),
  createProject: (project) => ipcRenderer.invoke('db-create-project', project),
  updateProject: (project) => ipcRenderer.invoke('db-update-project', project),
  deleteProject: (id) => ipcRenderer.invoke('db-delete-project', id),
  
  // Budgets
  getBudgets: () => ipcRenderer.invoke('db-get-budgets'),
  getBudgetById: (id) => ipcRenderer.invoke('db-get-budget', id),
  getBudgetsByProject: (projectId) => ipcRenderer.invoke('db-get-budgets-by-project', projectId),
  createBudget: (budget) => ipcRenderer.invoke('db-create-budget', budget),
  updateBudget: (budget) => ipcRenderer.invoke('db-update-budget', budget),
  deleteBudget: (id) => ipcRenderer.invoke('db-delete-budget', id),
  
  // Budget chapters, subchapters, and items
  getBudgetStructure: (budgetId) => ipcRenderer.invoke('db-get-budget-structure', budgetId),
  createBudgetChapter: (chapter) => ipcRenderer.invoke('db-create-budget-chapter', chapter),
  updateBudgetChapter: (chapter) => ipcRenderer.invoke('db-update-budget-chapter', chapter),
  deleteBudgetChapter: (id) => ipcRenderer.invoke('db-delete-budget-chapter', id),
  
  // Invoices
  getInvoices: () => ipcRenderer.invoke('db-get-invoices'),
  getInvoiceById: (id) => ipcRenderer.invoke('db-get-invoice', id),
  getInvoicesByProject: (projectId) => ipcRenderer.invoke('db-get-invoices-by-project', projectId),
  createInvoice: (invoice) => ipcRenderer.invoke('db-create-invoice', invoice),
  updateInvoice: (invoice) => ipcRenderer.invoke('db-update-invoice', invoice),
  deleteInvoice: (id) => ipcRenderer.invoke('db-delete-invoice', id),
  
  // Calendar events
  getCalendarEvents: () => ipcRenderer.invoke('db-get-calendar-events'),
  createCalendarEvent: (event) => ipcRenderer.invoke('db-create-calendar-event', event),
  updateCalendarEvent: (event) => ipcRenderer.invoke('db-update-calendar-event', event),
  deleteCalendarEvent: (id) => ipcRenderer.invoke('db-delete-calendar-event', id),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('db-get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('db-update-settings', settings),
  
  // Materials and suppliers
  getMaterials: () => ipcRenderer.invoke('db-get-materials'),
  createMaterial: (material) => ipcRenderer.invoke('db-create-material', material),
  updateMaterial: (material) => ipcRenderer.invoke('db-update-material', material),
  deleteMaterial: (id) => ipcRenderer.invoke('db-delete-material', id),
  
  getSuppliers: () => ipcRenderer.invoke('db-get-suppliers'),
  createSupplier: (supplier) => ipcRenderer.invoke('db-create-supplier', supplier),
  updateSupplier: (supplier) => ipcRenderer.invoke('db-update-supplier', supplier),
  deleteSupplier: (id) => ipcRenderer.invoke('db-delete-supplier', id),
});