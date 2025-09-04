import React, { useState, useEffect } from 'react'

interface User {
  key?: string
  name: string
  email: string
  status: string
  level: number
  tags: string[]
  createdAt: number
}

interface Settings {
  theme: string
  language: string
  notifications: boolean
  version: string
  lastUpdated: number
}

export const AceBaseDemo: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking AceBase...')
  const [isWorking, setIsWorking] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [demoTestValue, setDemoTestValue] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [newUser, setNewUser] = useState<Omit<User, 'key' | 'createdAt'>>({
    name: '',
    email: '',
    status: 'active',
    level: 1,
    tags: []
  })

  useEffect(() => {
    checkAceBase()
  }, [])

  const checkAceBase = async () => {
    try {
      // Try to get the demo test value that was automatically inserted
      const result = await window.electronAPI.acebaseGet('demo/test-value')
      
      if (result.success && result.data) {
        setDemoTestValue(result.data.testValue)
        setStatus('AceBase is working! Demo value retrieved successfully.')
        setIsWorking(true)
        
        // Load users, settings, and stats
        loadUsers()
        loadSettings()
        loadStats()
      } else {
        setStatus('AceBase connected but demo value not found')
      }
    } catch (error) {
      setStatus('Error testing AceBase: ' + (error as Error).message)
      console.error('AceBase test error:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const result = await window.electronAPI.acebaseQuery('users', { limit: 10 })
      
      if (result.success) {
        setUsers(result.data || [])
      } else {
        console.error('Failed to load users:', result.error)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.acebaseGet('settings')
      
      if (result.success && result.data) {
        setSettings(result.data)
      } else {
        console.error('Failed to load settings:', result.error)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadStats = async () => {
    try {
      const result = await window.electronAPI.acebaseGetStats()
      
      if (result.success) {
        setStats(result.stats)
      } else {
        console.error('Failed to load stats:', result.error)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const addUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      setMessage('Please fill in name and email')
      return
    }

    setLoading(true)
    try {
      const userData = {
        ...newUser,
        createdAt: Date.now()
      }
      
      const result = await window.electronAPI.acebasePush('users', userData)
      
      if (result.success) {
        setMessage('User added successfully! Key: ' + result.key)
        setNewUser({ name: '', email: '', status: 'active', level: 1, tags: [] })
        loadUsers()
      } else {
        setMessage('Error adding user: ' + result.error)
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message)
    }
    setLoading(false)
  }

  const deleteUser = async (key: string) => {
    setLoading(true)
    try {
      const result = await window.electronAPI.acebaseRemove(`users/${key}`)
      
      if (result.success) {
        setMessage('User deleted successfully')
        loadUsers()
      } else {
        setMessage('Error deleting user: ' + result.error)
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message)
    }
    setLoading(false)
  }

  const updateSetting = async (key: string, value: any) => {
    setLoading(true)
    try {
      const result = await window.electronAPI.acebaseUpdate('settings', { [key]: value, lastUpdated: Date.now() })
      
      if (result.success) {
        setMessage(`Setting '${key}' updated successfully`)
        loadSettings()
      } else {
        setMessage('Error updating setting: ' + result.error)
      }
    } catch (error) {
      setMessage('Error: ' + (error as Error).message)
    }
    setLoading(false)
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setNewUser({ ...newUser, tags })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">AceBase NoSQL Database Demo</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isWorking ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
          }`}></div>
          <span className={`text-sm ${
            isWorking ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isWorking ? 'AceBase Working' : 'Checking...'}
          </span>
        </div>
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status and Demo Value */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Database Status</h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Status:</div>
              <div className={`font-medium ${
                isWorking ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {status}
              </div>
            </div>

            {demoTestValue && (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400 mb-2">Demo Test Value:</div>
                <div className="font-mono text-sm text-blue-400 break-all">{demoTestValue}</div>
              </div>
            )}

            {stats && (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400 mb-2">Database Stats:</div>
                <div className="text-sm space-y-1">
                  <div className="text-white">Connected: <span className="text-green-400">{stats.connected ? 'Yes' : 'No'}</span></div>
                  <div className="text-white">DB Name: <span className="text-blue-400">{stats.dbName}</span></div>
                  <div className="text-white">Initialized: <span className="text-green-400">{stats.initialized ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Settings Demo</h3>
          
          {settings && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Theme:</span>
                <select 
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                  className="px-3 py-1 bg-black/20 border border-white/20 rounded text-white text-sm"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Language:</span>
                <select 
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="px-3 py-1 bg-black/20 border border-white/20 rounded text-white text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Notifications:</span>
                <button
                  onClick={() => updateSetting('notifications', !settings.notifications)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    settings.notifications 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {settings.notifications ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="text-xs text-gray-400 mt-3">
                Last updated: {new Date(settings.lastUpdated).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>

        {/* Add User Form */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Add New User</label>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                className="flex-1 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <input
                type="number"
                placeholder="Level"
                min="1"
                max="10"
                value={newUser.level}
                onChange={(e) => setNewUser({ ...newUser, level: parseInt(e.target.value) || 1 })}
                className="w-20 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newUser.tags.join(', ')}
                onChange={handleTagsChange}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={addUser}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>

          {/* Users List */}
          <div>
            <h4 className="text-white font-medium mb-3">Users ({users.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div key={user.key} className="p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          Level {user.level}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${ 
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.status}
                        </span>
                        {user.tags && user.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => user.key && deleteUser(user.key)}
                      disabled={loading}
                      className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-gray-400 text-center py-4">No users found</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p>This demo showcases AceBase NoSQL features:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Document-based storage with hierarchical paths</li>
          <li>Real-time data operations (get, set, push, update, remove)</li>
          <li>Query capabilities with filtering and ordering</li>
          <li>JSON-native data types and arrays</li>
          <li>Auto-generated unique keys for collections</li>
          <li>Settings management with real-time updates</li>
        </ul>
      </div>
    </div>
  )
}

