import React, { useState, useEffect } from 'react'

export const DatabaseDemo: React.FC = () => {
  const [demoValue, setDemoValue] = useState<string>('')
  const [status, setStatus] = useState<string>('Checking database...')
  const [isWorking, setIsWorking] = useState<boolean>(false)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Wait a bit for the context bridge to be available
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (!window.electronAPI) {
          setStatus('Electron API not available')
          return
        }

        // Try to get the demo test value that was automatically inserted
        const result = await window.electronAPI.dbGet(
          'SELECT value FROM settings WHERE key = ?', 
          ['demo_test']
        )
        
        if (result.success && result.data) {
          setDemoValue(result.data.value)
          setStatus('Database is working! Demo value retrieved successfully.')
          setIsWorking(true)
        } else {
          setStatus('Database connected but demo value not found')
        }
      } catch (error) {
        setStatus('Error testing database: ' + (error as Error).message)
        console.error('Database test error:', error)
      }
    }

    checkDatabase()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">SQLite Database Demo</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isWorking ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
          }`}></div>
          <span className={`text-sm ${
            isWorking ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isWorking ? 'Database Working' : 'Checking...'}
          </span>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Automatic Database Test</h3>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Status:</div>
            <div className={`font-medium ${
              isWorking ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {status}
            </div>
          </div>
          
          {demoValue && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-sm text-green-400 mb-2">Demo Value Retrieved from Database:</div>
              <div className="text-white font-mono text-sm break-all">
                {demoValue}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-400">
            <p>This demo automatically:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Creates SQLite database tables on startup</li>
              <li>Inserts a demo test value with timestamp</li>
              <li>Retrieves the value to verify database is working</li>
              <li>Displays the result here without user interaction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
