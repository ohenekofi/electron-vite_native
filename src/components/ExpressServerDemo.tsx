import React, { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
  created_at: string
}


export const ExpressServerDemo: React.FC = () => {
  const [serverPort, setServerPort] = useState<number | null>(null)
  const [apiResponse, setApiResponse] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getServerPort()
  }, [])

  const getServerPort = async () => {
    try {
      const port = await window.electronAPI.getServerPort()
      setServerPort(port)
      // Load users when server port is available
      if (port) {
        loadUsersFromAPI(port)
      }
    } catch (error) {
      console.error('Error getting server port:', error)
    }
  }

  const makeApiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    if (!serverPort) return null

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(`http://localhost:${serverPort}${endpoint}`, options)
      const data = await response.json()
      return { success: response.ok, data, status: response.status }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  const testHealthEndpoint = async () => {
    setLoading(true)
    const result = await makeApiCall('/api/health')
    
    if (result?.success) {
      setApiResponse(JSON.stringify(result.data, null, 2))
      setMessage('Health check successful!')
    } else {
      setApiResponse(result?.error || 'Failed to connect to server')
      setMessage('Health check failed!')
    }
    setLoading(false)
  }

  const loadUsersFromAPI = async (port?: number) => {
    const targetPort = port || serverPort
    if (!targetPort) return

    const result = await makeApiCall('/api/users')
    
    if (result?.success) {
      setUsers(result.data || [])
    } else {
      console.error('Failed to load users from API:', result?.error)
    }
  }

  const addUserViaAPI = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      setMessage('Please fill in all fields')
      return
    }

    setLoading(true)
    const result = await makeApiCall('/api/users', 'POST', newUser)
    
    if (result?.success) {
      setMessage('User added successfully via API!')
      setNewUser({ name: '', email: '' })
      loadUsersFromAPI()
    } else {
      setMessage('Error adding user via API: ' + (result?.error || 'Unknown error'))
    }
    setLoading(false)
  }

  const deleteUserViaAPI = async (id: number) => {
    setLoading(true)
    const result = await makeApiCall(`/api/users/${id}`, 'DELETE')
    
    if (result?.success) {
      setMessage('User deleted successfully via API!')
      loadUsersFromAPI()
    } else {
      setMessage('Error deleting user via API: ' + (result?.error || 'Unknown error'))
    }
    setLoading(false)
  }

  const testCustomEndpoint = async () => {
    const endpoints = [
      { path: '/api/settings', method: 'GET', description: 'Get all settings' },
      { path: '/api/upload', method: 'POST', description: 'File upload endpoint' }
    ]

    setLoading(true)
    const results = []

    for (const endpoint of endpoints) {
      const result = await makeApiCall(endpoint.path, endpoint.method)
      results.push({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        description: endpoint.description,
        success: result?.success || false,
        response: result?.data || result?.error
      })
    }

    setApiResponse(JSON.stringify(results, null, 2))
    setMessage('Custom endpoints tested!')
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Express Server Demo</h2>
        <div className="flex items-center space-x-4">
          {serverPort ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Server running on port {serverPort}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-red-400 text-sm">Server not available</span>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') || message.includes('failed') 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* API Testing */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">API Testing</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={testHealthEndpoint}
                disabled={loading || !serverPort}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                Test Health
              </button>
              <button
                onClick={testCustomEndpoint}
                disabled={loading || !serverPort}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                Test Endpoints
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">API Response</label>
              <textarea
                value={apiResponse}
                readOnly
                className="w-full h-64 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white font-mono text-sm resize-none focus:outline-none"
                placeholder="API responses will appear here..."
              />
            </div>

            {serverPort && (
              <div className="space-y-2">
                <label className="block text-white font-medium">Available Endpoints:</label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-blue-400 font-mono">GET /api/health</span>
                    <span className="text-gray-400">Server health check</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-green-400 font-mono">GET /api/users</span>
                    <span className="text-gray-400">Get all users</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-yellow-400 font-mono">POST /api/users</span>
                    <span className="text-gray-400">Create new user</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-red-400 font-mono">DELETE /api/users/:id</span>
                    <span className="text-gray-400">Delete user</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Management via API */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">User Management (API)</h3>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addUserViaAPI}
              disabled={loading || !serverPort}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Adding...' : 'Add User via API'}
            </button>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">Users from API ({users.length})</h4>
                <button
                  onClick={() => loadUsersFromAPI()}
                  disabled={loading || !serverPort}
                  className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-sm rounded transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                    <button
                      onClick={() => deleteUserViaAPI(user.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    {serverPort ? 'No users found' : 'Server not available'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Server Information */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Express Server Information</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-blue-400 font-medium">🚀 Server Features</div>
            <ul className="text-gray-300 space-y-1">
              <li>• Express.js framework</li>
              <li>• CORS enabled</li>
              <li>• JSON body parsing</li>
              <li>• SQLite integration</li>
              <li>• RESTful API endpoints</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-green-400 font-medium">🔧 Available APIs</div>
            <ul className="text-gray-300 space-y-1">
              <li>• Health check endpoint</li>
              <li>• User CRUD operations</li>
              <li>• Settings management</li>
              <li>• File upload ready</li>
              <li>• Error handling</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-purple-400 font-medium">⚡ Integration</div>
            <ul className="text-gray-300 space-y-1">
              <li>• Runs in main process</li>
              <li>• Auto-port selection</li>
              <li>• Hot reload support</li>
              <li>• IPC communication</li>
              <li>• Database connection</li>
            </ul>
          </div>
        </div>
        
        {serverPort && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-blue-400 font-medium mb-2">🌐 Server Access</div>
            <div className="text-gray-300 text-sm space-y-1">
              <div>Base URL: <span className="font-mono text-blue-400">http://localhost:{serverPort}</span></div>
              <div>Health Check: <span className="font-mono text-green-400">http://localhost:{serverPort}/api/health</span></div>
              <div>Users API: <span className="font-mono text-yellow-400">http://localhost:{serverPort}/api/users</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}