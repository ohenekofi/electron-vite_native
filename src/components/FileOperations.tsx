import React, { useState } from 'react'

export const FileOperations: React.FC = () => {
  const [filePath, setFilePath] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [saveContent, setSaveContent] = useState('')
  const [savePath, setSavePath] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const readFile = async () => {
    if (!filePath.trim()) {
      setMessage('Please enter a file path')
      return
    }

    setLoading(true)
    try {
      const result = await window.electronAPI.readFile(filePath)
      if (result.success) {
        setFileContent(result.data || '')
        setMessage('File read successfully!')
      } else {
        setMessage('Error reading file: ' + result.error)
        setFileContent('')
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message)
    }
    setLoading(false)
  }

  const writeFile = async () => {
    if (!savePath.trim()) {
      setMessage('Please enter a save path')
      return
    }

    setLoading(true)
    try {
      const result = await window.electronAPI.writeFile(savePath, saveContent)
      if (result.success) {
        setMessage('File saved successfully!')
      } else {
        setMessage('Error saving file: ' + result.error)
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message)
    }
    setLoading(false)
  }

  const showDialog = async () => {
    try {
      const result = await window.electronAPI.showMessageBox({
        type: 'info',
        title: 'File Operations Demo',
        message: 'This is a dialog from the main process!',
        detail: 'You can create various types of dialogs using Electron\'s dialog API.',
        buttons: ['Cool!', 'Awesome!', 'Cancel'],
        defaultId: 0,
        cancelId: 2
      })
      
      const buttonLabels = ['Cool!', 'Awesome!', 'Cancel']
      setMessage(`Dialog result: You clicked "${buttonLabels[result.response]}"`)
    } catch (error) {
      setMessage('Error showing dialog: ' + (error as Error).message)
    }
  }

  const loadSampleFiles = () => {
    const samples = [
      { path: '/etc/hosts', description: 'System hosts file (Unix/Linux)' },
      { path: 'C:\\Windows\\System32\\drivers\\etc\\hosts', description: 'System hosts file (Windows)' },
      { path: './package.json', description: 'Project package.json' },
      { path: './README.md', description: 'Project README' }
    ]

    return samples
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">File Operations Demo</h2>
        <button
          onClick={showDialog}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Show Dialog
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Read File Section */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Read File</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">File Path</label>
              <input
                type="text"
                placeholder="Enter file path (e.g., ./package.json)"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={readFile}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Reading...' : 'Read File'}
            </button>

            <div className="space-y-2">
              <label className="block text-white font-medium">Sample Files:</label>
              <div className="space-y-1">
                {loadSampleFiles().map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setFilePath(sample.path)}
                    className="block w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 text-blue-400 text-sm rounded transition-colors"
                  >
                    <div className="font-mono">{sample.path}</div>
                    <div className="text-gray-400 text-xs">{sample.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {fileContent && (
              <div>
                <label className="block text-white font-medium mb-2">File Content</label>
                <textarea
                  value={fileContent}
                  readOnly
                  className="w-full h-64 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white font-mono text-sm resize-none focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Write File Section */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Write File</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Save Path</label>
              <input
                type="text"
                placeholder="Enter save path (e.g., ./output.txt)"
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Content</label>
              <textarea
                value={saveContent}
                onChange={(e) => setSaveContent(e.target.value)}
                placeholder="Enter content to save..."
                className="w-full h-64 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={writeFile}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save File'}
            </button>

            <div className="space-y-2">
              <label className="block text-white font-medium">Quick Fill:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSaveContent(JSON.stringify({ 
                    name: 'Electron App', 
                    version: '1.0.0',
                    created: new Date().toISOString()
                  }, null, 2))}
                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-sm rounded transition-colors"
                >
                  JSON Sample
                </button>
                <button
                  onClick={() => setSaveContent(`# My Electron App

This is a sample markdown file created by the Electron app.

## Features
- SQLite3 database
- Express server
- File operations
- Hot reload

Created: ${new Date().toLocaleString()}`)}
                  className="px-3 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-sm rounded transition-colors"
                >
                  Markdown Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Operations Info */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">File Operations Info</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-blue-400 font-medium">✅ Supported Operations</div>
            <ul className="text-gray-300 space-y-1">
              <li>• Read text files</li>
              <li>• Write text files</li>
              <li>• Show system dialogs</li>
              <li>• File path validation</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-yellow-400 font-medium">⚠️ Security Notes</div>
            <ul className="text-gray-300 space-y-1">
              <li>• Sandboxed file access</li>
              <li>• No direct filesystem API</li>
              <li>• Uses main process bridge</li>
              <li>• Context isolation enabled</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-purple-400 font-medium">🔧 Features</div>
            <ul className="text-gray-300 space-y-1">
              <li>• Async file operations</li>
              <li>• Error handling</li>
              <li>• Progress indicators</li>
              <li>• Sample file shortcuts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}