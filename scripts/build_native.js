#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 Building native modules for Electron...')

// Get Electron version from package.json
const packageJson = require('../package.json')
const electronVersion = packageJson.devDependencies.electron.replace('^', '')

console.log(`📦 Electron version: ${electronVersion}`)

// Rebuild native modules for Electron
try {
  console.log('🛠️  Rebuilding SQLite3 for Electron...')
  
  // Clean previous builds
  execSync('npx @electron/rebuild', { stdio: 'inherit' })
  
  console.log('✅ Native modules rebuilt successfully!')
  
  // Verify SQLite3 binary exists
  const sqlitePath = path.join(__dirname, '../node_modules/sqlite3/lib/binding')
  if (fs.existsSync(sqlitePath)) {
    const binaries = fs.readdirSync(sqlitePath)
    console.log('📋 Available SQLite3 binaries:')
    binaries.forEach(binary => {
      console.log(`   - ${binary}`)
    })
  }
  
} catch (error) {
  console.error('❌ Error rebuilding native modules:', error.message)
  
  // Fallback: try manual rebuild
  console.log('🔄 Attempting manual rebuild...')
  try {
    execSync('npx @electron/rebuild', { stdio: 'inherit' })
    console.log('✅ Manual rebuild successful!')
  } catch (fallbackError) {
    console.error('❌ Manual rebuild failed:', fallbackError.message)
    console.log('\n📝 Troubleshooting tips:')
    console.log('   1. Make sure you have build tools installed')
    console.log('   2. On Windows: npm install --global windows-build-tools')
    console.log('   3. On macOS: xcode-select --install')  
    console.log('   4. On Linux: sudo apt-get install build-essential')
    process.exit(1)
  }
}