import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const electronAPI = {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  
  // Dialog operations
  showMessageBox: (options: Electron.MessageBoxOptions) => ipcRenderer.invoke('show-message-box', options),
  
  // Database operations
  dbQuery: (query: string, params?: any[]) => ipcRenderer.invoke('db-query', query, params),
  dbRun: (query: string, params?: any[]) => ipcRenderer.invoke('db-run', query, params),
  dbGet: (query: string, params?: any[]) => ipcRenderer.invoke('db-get', query, params),
  dbAll: (query: string, params?: any[]) => ipcRenderer.invoke('db-all', query, params),
  
  // AceBase NoSQL operations
  acebaseGet: (path: string) => ipcRenderer.invoke('acebase-get', path),
  acebaseSet: (path: string, data: any) => ipcRenderer.invoke('acebase-set', path, data),
  acebasePush: (path: string, data: any) => ipcRenderer.invoke('acebase-push', path, data),
  acebaseUpdate: (path: string, updates: any) => ipcRenderer.invoke('acebase-update', path, updates),
  acebaseRemove: (path: string) => ipcRenderer.invoke('acebase-remove', path),
  acebaseQuery: (path: string, options?: any) => ipcRenderer.invoke('acebase-query', path, options),
  acebaseGetStats: () => ipcRenderer.invoke('acebase-get-stats'),
  
  // Express server operations
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  
  // Event listeners
  onMainProcessMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('main-process-message', (event, message) => callback(message))
  },
  
  onMenuNewFile: (callback: () => void) => {
    ipcRenderer.on('menu-new-file', callback)
  },
  
  onMenuOpenFile: (callback: (filePath: string) => void) => {
    ipcRenderer.on('menu-open-file', (event, filePath) => callback(filePath))
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Types for TypeScript
export type ElectronAPI = typeof electronAPI