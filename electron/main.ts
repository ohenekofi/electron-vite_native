import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'node:path'
import { startExpressServer } from './express-server.js'
import { initDatabase, getDatabaseReady } from './database.js'
import { initAceBase, getAceBaseReady } from './acebase-db.js'

// Debug logging
console.log('NODE env VITE_DEV_SERVER_URL:', process.env.VITE_DEV_SERVER_URL)

// The built directory structure
process.env.APP_ROOT = path.join(__dirname, '../..')

// Try to get VITE_DEV_SERVER_URL, with a fallback for development
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'] || 'http://localhost:5174'
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'out')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    // DEV: load from Vite dev server (HMR active)
    console.log('Loading renderer from Vite dev server at', VITE_DEV_SERVER_URL)
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()

    // Listen for electron-vite hot-reload messages (preload/main rebuilds)
    process.on('message', (msg) => {
      if (msg === 'electron-vite&type=hot-reload' || msg === 'electron-vite&type=reload') {
        console.log('electron-vite hot-reload message received:', msg)
        // reload renderer windows to pick up rebuilt preload/main changes
        for (const w of BrowserWindow.getAllWindows()) {
          try { w.webContents.reload() } catch (e) { /* ignore */ }
        }
      }
    })
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  createWindow()
  
  // Initialize databases in parallel and wait for both to be ready
  await Promise.all([
    initDatabase(),
    initAceBase()
  ])
  
  // Start Express server after both databases are ready
  startExpressServer()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('show-message-box', async (event, options) => {
  const { dialog } = await import('electron')
  if (win) {
    return dialog.showMessageBox(win, options)
  }
})

ipcMain.handle('read-file', async (event, filePath: string) => {
  const { readFile } = await import('fs/promises')
  try {
    const data = await readFile(filePath, 'utf8')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
  const { writeFile } = await import('fs/promises')
  try {
    await writeFile(filePath, content, 'utf8')
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// Menu setup
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          win?.webContents.send('menu-new-file')
        }
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
          const { dialog } = await import('electron')
          if (win) {
            const result = await dialog.showOpenDialog(win, {
              properties: ['openFile'],
              filters: [
                { name: 'All Files', extensions: ['*'] }
              ]
            })
            if (!result.canceled) {
              win.webContents.send('menu-open-file', result.filePaths[0])
            }
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)