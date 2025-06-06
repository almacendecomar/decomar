// Type definitions for the application
export interface Client {
  id: string;
  name: string;
  tax_id?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  client_name?: string;
  name: string;
  address?: string;
  type?: string;
  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  number: string;
  project_id: string;
  project_name?: string;
  client_name?: string;
  date: string;
  status: 'draft' | 'pending' | 'accepted' | 'rejected';
  notes?: string;
  default_margin?: number;
  default_vat?: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetChapter {
  id: string;
  budget_id: string;
  number: string;
  title: string;
  estimated_time?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetSubchapter {
  id: string;
  chapter_id: string;
  number: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  subchapter_id: string;
  number: string;
  description: string;
  quantity: number;
  purchase_price: number;
  margin_percentage: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  number: string;
  budget_id?: string;
  project_id: string;
  project_name?: string;
  client_name?: string;
  date: string;
  due_date?: string;
  status: 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  vat_rate: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  project_id?: string;
  project_name?: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  event_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  tax_id?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  supplier_id?: string;
  supplier_name?: string;
  code?: string;
  name: string;
  description?: string;
  purchase_price?: number;
  unit?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  project_name?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  company_name?: string;
  company_tax_id?: string;
  company_address?: string;
  company_email?: string;
  company_phone?: string;
  company_logo?: Blob;
  default_vat: number;
  default_margin: number;
  theme_color: string;
  export_path?: string;
  digital_signature?: Blob;
  language: string;
}

// Global window interface for Electron APIs
declare global {
  interface Window {
    electron: {
      selectDirectory: () => Promise<string | null>;
      saveFile: (options: { content: string; defaultPath: string; filters: any[] }) => Promise<string | null>;
      openFile: (options: { filters: any[] }) => Promise<{ path: string; content: Buffer } | null>;
      backupDatabase: (options: { defaultPath: string }) => Promise<string | null>;
      restoreDatabase: () => Promise<string | null>;
      getAppVersion: () => Promise<string>;
      closeApp: () => void;
      minimizeApp: () => void;
      maximizeApp: () => void;
    };
    database: {
      // Clients
      getClients: () => Promise<Client[]>;
      getClientById: (id: string) => Promise<Client | null>;
      createClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client>;
      updateClient: (client: Client) => Promise<Client>;
      deleteClient: (id: string) => Promise<any>;
      
      // Projects
      getProjects: () => Promise<Project[]>;
      getProjectById: (id: string) => Promise<Project | null>;
      getProjectsByClient: (clientId: string) => Promise<Project[]>;
      createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
      updateProject: (project: Project) => Promise<Project>;
      deleteProject: (id: string) => Promise<any>;
      
      // Budgets
      getBudgets: () => Promise<Budget[]>;
      getBudgetById: (id: string) => Promise<Budget | null>;
      getBudgetsByProject: (projectId: string) => Promise<Budget[]>;
      createBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => Promise<Budget>;
      updateBudget: (budget: Budget) => Promise<Budget>;
      deleteBudget: (id: string) => Promise<any>;
      
      // Budget structure
      getBudgetStructure: (budgetId: string) => Promise<any>;
      createBudgetChapter: (chapter: Omit<BudgetChapter, 'id' | 'created_at' | 'updated_at'>) => Promise<BudgetChapter>;
      updateBudgetChapter: (chapter: BudgetChapter) => Promise<BudgetChapter>;
      deleteBudgetChapter: (id: string) => Promise<any>;
      
      // Invoices
      getInvoices: () => Promise<Invoice[]>;
      getInvoiceById: (id: string) => Promise<Invoice | null>;
      getInvoicesByProject: (projectId: string) => Promise<Invoice[]>;
      createInvoice: (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => Promise<Invoice>;
      updateInvoice: (invoice: Invoice) => Promise<Invoice>;
      deleteInvoice: (id: string) => Promise<any>;
      
      // Calendar events
      getCalendarEvents: () => Promise<CalendarEvent[]>;
      createCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<CalendarEvent>;
      updateCalendarEvent: (event: CalendarEvent) => Promise<CalendarEvent>;
      deleteCalendarEvent: (id: string) => Promise<any>;
      
      // Settings
      getSettings: () => Promise<Settings>;
      updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
      
      // Materials and suppliers
      getMaterials: () => Promise<Material[]>;
      createMaterial: (material: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => Promise<Material>;
      updateMaterial: (material: Material) => Promise<Material>;
      deleteMaterial: (id: string) => Promise<any>;
      
      getSuppliers: () => Promise<Supplier[]>;
      createSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<Supplier>;
      updateSupplier: (supplier: Supplier) => Promise<Supplier>;
      deleteSupplier: (id: string) => Promise<any>;
      
      // Tasks
      getTasks: () => Promise<Task[]>;
      createTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
      updateTask: (task: Task) => Promise<Task>;
      deleteTask: (id: string) => Promise<any>;
    };
  }
}