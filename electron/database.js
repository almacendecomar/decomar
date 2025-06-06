import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { app, ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';

// Get the user data directory for storing the database
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'decopres.db');

// Database instance
let db;

// Initialize the database with all required tables
export function initializeDatabase() {
  const dbExists = fs.existsSync(dbPath);
  
  db = new Database(dbPath, { verbose: console.log });
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  if (!dbExists) {
    createTables();
    seedDefaultData();
  }
  
  // Register IPC handlers for database operations
  registerIpcHandlers();
  
  return db;
}

// Create all tables if they don't exist
function createTables() {
  // Settings table for application configuration
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      company_name TEXT,
      company_tax_id TEXT,
      company_address TEXT,
      company_email TEXT,
      company_phone TEXT,
      company_logo BLOB,
      default_vat REAL DEFAULT 21.0,
      default_margin REAL DEFAULT 20.0,
      theme_color TEXT DEFAULT '#2563eb',
      export_path TEXT,
      digital_signature BLOB,
      language TEXT DEFAULT 'es'
    );
  `);

  // Users table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      email TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    );
  `);

  // Clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tax_id TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      phone TEXT,
      email TEXT,
      contact_person TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Projects (obras) table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      type TEXT,
      start_date TEXT,
      expected_end_date TEXT,
      actual_end_date TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
  `);

  // Attachments table for storing file references
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Budgets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      project_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      notes TEXT,
      default_margin REAL,
      default_vat REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Budget chapters
  db.exec(`
    CREATE TABLE IF NOT EXISTS budget_chapters (
      id TEXT PRIMARY KEY,
      budget_id TEXT NOT NULL,
      number TEXT NOT NULL,
      title TEXT NOT NULL,
      estimated_time REAL,
      order_index INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
    );
  `);

  // Budget subchapters
  db.exec(`
    CREATE TABLE IF NOT EXISTS budget_subchapters (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      number TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES budget_chapters(id) ON DELETE CASCADE
    );
  `);

  // Budget items (partidas)
  db.exec(`
    CREATE TABLE IF NOT EXISTS budget_items (
      id TEXT PRIMARY KEY,
      subchapter_id TEXT NOT NULL,
      number TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      purchase_price REAL NOT NULL,
      margin_percentage REAL NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subchapter_id) REFERENCES budget_subchapters(id) ON DELETE CASCADE
    );
  `);

  // Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      budget_id TEXT,
      project_id TEXT NOT NULL,
      date TEXT NOT NULL,
      due_date TEXT,
      status TEXT DEFAULT 'issued',
      notes TEXT,
      vat_rate REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Invoice items
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      order_index INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );
  `);

  // Calendar events
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      all_day INTEGER DEFAULT 0,
      event_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Suppliers
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tax_id TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      phone TEXT,
      email TEXT,
      contact_person TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Materials catalog
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      supplier_id TEXT,
      code TEXT,
      name TEXT NOT NULL,
      description TEXT,
      purchase_price REAL,
      unit TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    );
  `);

  // Tasks (Kanban)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      assigned_to TEXT,
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Template categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS template_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Templates for budget structures
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES template_categories(id) ON DELETE SET NULL
    );
  `);
}

// Insert default data for initial app configuration
function seedDefaultData() {
  // Create default settings
  db.prepare(`
    INSERT INTO settings (
      id, company_name, company_tax_id, default_vat, default_margin, theme_color, language
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(1, 'Mi Empresa', 'A12345678', 21.0, 20.0, '#2563eb', 'es');
  
  // Create default admin user (password: admin)
  db.prepare(`
    INSERT INTO users (
      id, username, password_hash, full_name, role
    ) VALUES (?, ?, ?, ?, ?)
  `).run(uuidv4(), 'admin', 'admin', 'Administrador', 'admin');
}

// Register IPC handlers for database operations
function registerIpcHandlers() {
  // Settings
  ipcMain.handle('db-get-settings', () => {
    return db.prepare('SELECT * FROM settings WHERE id = 1').get();
  });
  
  ipcMain.handle('db-update-settings', (event, settings) => {
    const stmt = db.prepare(`
      UPDATE settings SET
        company_name = ?,
        company_tax_id = ?,
        company_address = ?,
        company_email = ?,
        company_phone = ?,
        default_vat = ?,
        default_margin = ?,
        theme_color = ?,
        export_path = ?,
        language = ?
      WHERE id = 1
    `);
    
    stmt.run(
      settings.company_name,
      settings.company_tax_id,
      settings.company_address,
      settings.company_email,
      settings.company_phone,
      settings.default_vat,
      settings.default_margin,
      settings.theme_color,
      settings.export_path,
      settings.language
    );
    
    return db.prepare('SELECT * FROM settings WHERE id = 1').get();
  });
  
  // Clients
  ipcMain.handle('db-get-clients', () => {
    return db.prepare('SELECT * FROM clients ORDER BY name').all();
  });
  
  ipcMain.handle('db-get-client', (event, id) => {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  });
  
  ipcMain.handle('db-create-client', (event, client) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO clients (
        id, name, tax_id, address, city, postal_code, phone, email, contact_person, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      client.name,
      client.tax_id,
      client.address,
      client.city,
      client.postal_code,
      client.phone,
      client.email,
      client.contact_person,
      client.notes
    );
    
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  });
  
  ipcMain.handle('db-update-client', (event, client) => {
    const stmt = db.prepare(`
      UPDATE clients SET
        name = ?,
        tax_id = ?,
        address = ?,
        city = ?,
        postal_code = ?,
        phone = ?,
        email = ?,
        contact_person = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      client.name,
      client.tax_id,
      client.address,
      client.city,
      client.postal_code,
      client.phone,
      client.email,
      client.contact_person,
      client.notes,
      client.id
    );
    
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(client.id);
  });
  
  ipcMain.handle('db-delete-client', (event, id) => {
    return db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  });
  
  // Projects
  ipcMain.handle('db-get-projects', () => {
    return db.prepare(`
      SELECT p.*, c.name as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `).all();
  });
  
  ipcMain.handle('db-get-project', (event, id) => {
    return db.prepare(`
      SELECT p.*, c.name as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `).get(id);
  });
  
  ipcMain.handle('db-get-projects-by-client', (event, clientId) => {
    return db.prepare(`
      SELECT * FROM projects WHERE client_id = ? ORDER BY name
    `).all(clientId);
  });
  
  // Add more IPC handlers for budgets, invoices, etc.
}

// Export functions for backup and restore
export function backupDatabase(targetPath) {
  db.pragma('wal_checkpoint(FULL)');
  fs.copyFileSync(dbPath, targetPath);
  return true;
}

export function restoreDatabase(sourcePath) {
  // Close current database connection
  db.close();
  
  // Replace the database file
  fs.copyFileSync(sourcePath, dbPath);
  
  // Reopen the database
  db = new Database(dbPath, { verbose: console.log });
  db.pragma('foreign_keys = ON');
  
  return true;
}