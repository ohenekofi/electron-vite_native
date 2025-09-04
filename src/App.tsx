import { useState, useEffect } from 'react'
import { DatabaseDemo } from './components/DatabaseDemo'
import { FileOperations } from './components/FileOperations'
import { ExpressServerDemo } from './components/ExpressServerDemo'
import { AceBaseDemo } from './components/AceBaseDemo'
import { HotReloadTest } from './components/HotReloadTest'
import './App.css'

function App() {
  const [currentTab, setCurrentTab] = useState('database')
  const [appVersion, setAppVersion] = useState<string>('')
  const [mainProcessMessage, setMainProcessMessage] = useState<string>('')

  useEffect(() => {
    // Get app version
    window.electronAPI?.getAppVersion().then(version => {
      setAppVersion(version)
    })

    // Listen to main process messages
    window.electronAPI?.onMainProcessMessage((message) => {
      setMainProcessMessage(message)
    })

    // Listen to menu events
    window.electronAPI?.onMenuNewFile(() => {
      console.log('New file menu clicked')
      // Handle new file creation
    })

    window.electronAPI?.onMenuOpenFile((filePath) => {
      console.log('Open file menu clicked:', filePath)
      // Handle file opening
    })

    return () => {
      // Cleanup listeners
      window.electronAPI?.removeAllListeners('main-process-message')
      window.electronAPI?.removeAllListeners('menu-new-file')
      window.electronAPI?.removeAllListeners('menu-open-file')
    }
  }, [])

  const tabs = [
    { id: 'database', label: 'SQLite Database', icon: '🗄️' },
    { id: 'acebase', label: 'AceBase NoSQL', icon: '🔥' },
    { id: 'files', label: 'File Operations', icon: '📁' },
    { id: 'server', label: 'Express Server', icon: '🌐' },
    { id: 'hotreload', label: 'Hot Reload Test', icon: '🔄' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h1 className="text-xl font-bold text-white">
                  Electron + Vite + Express + React + Native Module Support + HMR
                </h1>
              </div>
              {appVersion && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                  v{appVersion}
                </span>
              )}
            </div>
            
            {mainProcessMessage && (
              <div className="text-sm text-gray-300">
                Last updated: {mainProcessMessage}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/10 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${currentTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          {currentTab === 'database' && <DatabaseDemo />}
          {currentTab === 'acebase' && <AceBaseDemo />}
          {currentTab === 'files' && <FileOperations />}
          {currentTab === 'server' && <ExpressServerDemo />}
          {currentTab === 'hotreload' && <HotReloadTest />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Modern Electron app with React, Vite, SQLite3, AceBase NoSQL, and Express
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>🚀 Hot Reload Working Perfectly!</span>
              <span>⚡ Powered by Electron-Vite</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App