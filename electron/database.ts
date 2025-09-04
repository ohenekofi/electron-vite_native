import sqlite3 from 'sqlite3'
import { ipcMain, app } from 'electron'
import path from 'path'

let db: sqlite3.Database
let dbInitialized = false

// Promise to track database initialization
let dbInitPromise: Promise<void>

function getDatabaseReady(): Promise<void> {
  return dbInitPromise || Promise.resolve()
}

function getSQLitePath() {
  // Handle different environments
  if (app.isPackaged) {
    // Production: use bundled SQLite3
    return sqlite3
  } else {
    // Development: use verbose mode for debugging
    return sqlite3.verbose()
  }
}

export function initDatabase() {
  // Get the correct SQLite3 instance
  const SQLite3 = getSQLitePath()
  
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'app-database.sqlite')
  
  console.log('📁 Database path:', dbPath)
  console.log('📦 App packaged:', app.isPackaged)
  
  // Create a promise for database initialization
  dbInitPromise = new Promise((resolve, reject) => {
    db = new SQLite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message)
        
        // Try verbose mode for debugging
        const verboseDb = SQLite3.verbose()
        db = new verboseDb.Database(dbPath, (retryErr) => {
          if (retryErr) {
            console.error('❌ Retry failed:', retryErr.message)
            reject(retryErr)
          } else {
            console.log('✅ Database connected (retry successful)')
            createTables(resolve)
          }
        })
      } else {
        console.log('✅ Connected to SQLite database at:', dbPath)
        createTables(resolve)
      }
    })
    
    // Handle database errors
    db.on('error', (err) => {
      console.error('💥 Database error:', err.message)
    })
    
    // Handle database close
    db.on('close', () => {
      console.log('🔒 Database connection closed')
      dbInitialized = false
    })
  })
  
  return dbInitPromise
}

function createTables(resolve?: () => void) {
  console.log('🔧 Creating database tables...');
  
  // Create tables synchronously to ensure they exist before the app continues
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err.message);
      } else {
        console.log('✅ Users table created/verified');
      }
    });
    
    // Settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating settings table:', err.message);
      } else {
        console.log('✅ Settings table created/verified');
        
        // Insert default settings after table is created
        db.run(`
          INSERT OR IGNORE INTO settings (key, value) VALUES 
          ('theme', 'dark'),
          ('language', 'en'),
          ('auto_save', 'true')
        `, (err) => {
          if (err) {
            console.error('❌ Error inserting default settings:', err.message);
          } else {
            console.log('✅ Default settings inserted');
            
            // Insert a test demo value and retrieve it to prove database works
            const testValue = `Demo test at ${new Date().toISOString()}`;
            
            db.run(`
              INSERT OR REPLACE INTO settings (key, value) VALUES ('demo_test', ?)
            `, [testValue], (insertErr) => {
              if (insertErr) {
                console.error('❌ Error inserting demo test:', insertErr.message);
              } else {
                console.log('✅ Demo test value inserted:', testValue);
                
                // Now retrieve it to prove it works
                db.get('SELECT value FROM settings WHERE key = ?', ['demo_test'], (selectErr, row: any) => {
                  if (selectErr) {
                    console.error('❌ Error retrieving demo test:', selectErr.message);
                  } else {
                    console.log('🎯 Demo test value retrieved from database:', row?.value);
                    console.log('🚀 DATABASE DEMO COMPLETE - SQLite3 is working correctly!');
                  }
                });
              }
            });
            
            dbInitialized = true;
            if (resolve) resolve();
          }
        });
      }
    });
  });
}

// IPC handlers for database operations
ipcMain.handle('db-query', async (event, query: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject({ success: false, error: err.message })
      } else {
        resolve({ success: true, data: rows })
      }
    })
  })
})

ipcMain.handle('db-run', async (event, query: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject({ success: false, error: err.message })
      } else {
        resolve({ 
          success: true, 
          lastID: this.lastID, 
          changes: this.changes 
        })
      }
    })
  })
})

ipcMain.handle('db-get', async (event, query: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject({ success: false, error: err.message })
      } else {
        resolve({ success: true, data: row })
      }
    })
  })
})

ipcMain.handle('db-all', async (event, query: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject({ success: false, error: err.message })
      } else {
        resolve({ success: true, data: rows })
      }
    })
  })
})

export { db, getDatabaseReady }