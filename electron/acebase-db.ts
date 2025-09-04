import { ipcMain, app } from 'electron'
import path from 'path'
import { promises as fs } from 'fs'
import { AceBase } from 'acebase'

let acebaseDb: AceBase | null = null
let acebaseInitialized = false

// Promise to track AceBase initialization
let acebaseInitPromise: Promise<void>

function getAceBaseReady(): Promise<void> {
  return acebaseInitPromise || Promise.resolve()
}

async function getAceBasePath() {
  // Handle different environments - similar to SQLite path resolution
  if (app.isPackaged) {
    // Production: use app data directory
    return path.join(app.getPath('userData'), 'acebase-data')
  } else {
    // Development: use local directory
    return path.join(process.cwd(), 'acebase-data')
  }
}

export function initAceBase() {
  console.log('🔧 Initializing AceBase NoSQL database...')
  
  // Create a promise for AceBase initialization
  acebaseInitPromise = new Promise(async (resolve, reject) => {
    try {
      const dbPath = await getAceBasePath()
      console.log('📁 AceBase database path:', dbPath)
      console.log('📦 App packaged:', app.isPackaged)

      // Ensure the directory exists
      try {
        await fs.mkdir(dbPath, { recursive: true })
        console.log('✅ AceBase directory created/verified')
      } catch (dirError) {
        console.warn('⚠️ Directory creation warning:', dirError instanceof Error ? dirError.message : String(dirError))
      }

      // Initialize AceBase with configuration
      acebaseDb = new AceBase('myapp', {
        storage: {
          path: dbPath
        },
        logLevel: 'warn'
      })

      // Wait for the database to be ready
      await acebaseDb.ready()

      console.log('✅ AceBase database initialized')
      
      // Create demo data
      await createDemoData()
      
      acebaseInitialized = true
      resolve()
      
    } catch (error) {
      console.error('❌ Error initializing AceBase:', error instanceof Error ? error.message : String(error))
      acebaseInitialized = false
      reject(error)
    }
  })
  
  return acebaseInitPromise
}

async function createDemoData() {
  try {
    if (!acebaseDb) return

    console.log('🔧 Creating AceBase demo data...')
    
    // Create a demo user collection
    const usersRef = acebaseDb.ref('users')
    
    // Create a test user with auto-generated ID
    const newUserRef = await usersRef.push({
      name: 'Demo User',
      email: 'demo@example.com',
      status: 'active',
      level: 5,
      tags: ['developer', 'typescript', 'electron'],
      createdAt: Date.now()
    })
    
    console.log('✅ Demo user created with ID:', newUserRef.key)
    
    // Create a specific user item
    await acebaseDb.ref('users/demo-user-fixed').set({
      name: 'Fixed Demo User',
      email: 'fixed@example.com',
      status: 'active',
      level: 3,
      tags: ['manager', 'project-lead'],
      createdAt: Date.now()
    })
    
    console.log('✅ Fixed demo user created')
    
    // Store a demo value similar to SQLite3
    const testValue = `AceBase demo test at ${new Date().toISOString()}`
    await acebaseDb.ref('demo/test-value').set({
      testValue: testValue,
      timestamp: Date.now()
    })
    
    console.log('✅ Demo test value stored:', testValue)
    
    // Create some settings
    await acebaseDb.ref('settings').set({
      theme: 'dark',
      language: 'en',
      notifications: true,
      version: '1.0.0',
      lastUpdated: Date.now()
    })
    
    console.log('✅ Demo settings created')
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error instanceof Error ? error.message : String(error))
  }
}

// IPC handlers for AceBase operations
ipcMain.handle('acebase-get', async (event, path: string) => {
  try {
    await getAceBaseReady()
    
    if (!acebaseDb) {
      return { success: false, error: 'AceBase not initialized' }
    }
    
    const snapshot = await acebaseDb.ref(path).get()
    const data = snapshot.exists() ? snapshot.val() : null
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('acebase-set', async (event, path: string, data: any) => {
  try {
    await getAceBaseReady()
    
    if (!acebaseDb) {
      return { success: false, error: 'AceBase not initialized' }
    }
    
    await acebaseDb.ref(path).set(data)
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('acebase-push', async (event, path: string, data: any) => {
  try {
    await getAceBaseReady()
    
    if (!acebaseDb) {
      return { success: false, error: 'AceBase not initialized' }
    }
    
    const ref = await acebaseDb.ref(path).push(data)
    
    return { success: true, key: ref.key }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('acebase-update', async (event, path: string, updates: any) => {
  try {
    await getAceBaseReady()
    
    if (!acebaseDb) {
      return { success: false, error: 'AceBase not initialized' }
    }
    
    await acebaseDb.ref(path).update(updates)
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('acebase-remove', async (event, path: string) => {
  try {
    await getAceBaseReady()
    
    if (!acebaseDb) {
      return { success: false, error: 'AceBase not initialized' }
    }
    
    await acebaseDb.ref(path).remove()
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('acebase-query', async (event, path: string, options?: any) => {
  try {
    await getAceBaseReady()
    
    if (!acebaseDb) {
      return { success: false, error: 'AceBase not initialized' }
    }
    
    let query = acebaseDb.ref(path)
    
    // For simple queries, just get all and filter/limit in memory
    const snapshot = await query.get()
    let data: any[] = []
    
    const snapVal = snapshot.val();
    if (snapVal && typeof snapVal === 'object') {
    Object.keys(snapVal).forEach(key => {
        const value = (snapVal as Record<string, any>)[key];
        data.push({
        key,
        ...value
        });
    });
    } else {
    // Handle direct primitive values
    data = [{ key: snapshot.key, value: snapVal }];
    }
    
    // Apply options if provided
    if (options) {
      if (options.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          data = data.filter(item => item[key] === value)
        }
      }
      if (options.limit) {
        data = data.slice(0, options.limit)
      }
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('acebase-get-stats', async (event) => {
  try {
    await getAceBaseReady()
    
    if (!acebaseDb) {
      return { success: false, error: 'AceBase not initialized' }
    }
    
    // Get some basic stats
    const stats = {
      connected: acebaseDb.isReady,
      dbName: acebaseDb.name,
      path: await getAceBasePath(),
      initialized: acebaseInitialized
    }
    
    return { success: true, stats }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

export { getAceBaseReady }