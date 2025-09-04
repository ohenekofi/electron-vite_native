// Electron API types
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>
  
  // Database operations
  dbQuery: (query: string, params?: any[]) => Promise<{ success: boolean; data?: any[]; error?: string }>
  dbRun: (query: string, params?: any[]) => Promise<{ success: boolean; lastID?: number; changes?: number; error?: string }>
  dbGet: (query: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>
  dbAll: (query: string, params?: any[]) => Promise<{ success: boolean; data?: any[]; error?: string }>
  
  // AceBase NoSQL operations
  acebaseGet: (path: string) => Promise<{ success: boolean; data?: any; error?: string }>
  acebaseSet: (path: string, data: any) => Promise<{ success: boolean; error?: string }>
  acebasePush: (path: string, data: any) => Promise<{ success: boolean; key?: string; error?: string }>
  acebaseUpdate: (path: string, updates: any) => Promise<{ success: boolean; error?: string }>
  acebaseRemove: (path: string) => Promise<{ success: boolean; error?: string }>
  acebaseQuery: (path: string, options?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>
  acebaseGetStats: () => Promise<{ success: boolean; stats?: any; error?: string }>
  
  // Express server
  getServerPort: () => Promise<number>
  
  // Event listeners
  onMainProcessMessage: (callback: (message: string) => void) => void
  onMenuNewFile: (callback: () => void) => void
  onMenuOpenFile: (callback: (filePath: string) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}