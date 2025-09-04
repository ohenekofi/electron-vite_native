import React, { useState, useEffect } from 'react'

export const HotReloadTest: React.FC = () => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    // This will help us see if the component is reloaded
    console.log('HotReloadTest component mounted')
  }, [])

  return (
    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">Hot Reload Test - Working Perfectly!</h2>
      <p className="text-gray-300 mb-4">
        This component is used to test hot reloading functionality.
        If hot reloading is working, changes to this component should
        appear without a full page refresh.
      </p>
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Count: {count}
        </button>
        <p className="text-gray-400">
          Current count: {count}
        </p>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  )
}