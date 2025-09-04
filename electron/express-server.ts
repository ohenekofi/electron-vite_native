// C:\Users\Indinis\Desktop\basework\native\electron\express-server.ts

import express, { Request, Response } from 'express' // <-- IMPORTANT: Import Request and Response
import cors from 'cors'
import { ipcMain } from 'electron'
import { db, getDatabaseReady } from './database.js'
import http from 'http'

let server: http.Server
let serverPort: number

export function startExpressServer() {
  const app = express()
  
  // Middleware
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  
  // API Routes
  app.get('/api/health', (req: Request, res: Response) => { // <-- Use official types
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  })
  
  // Users API
  app.get('/api/users', (req: Request, res: Response) => { // <-- Use official types
    db.all('SELECT * FROM users ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.json(rows)
      }
    })
  })
  
  app.post('/api/users', (req: Request, res: Response) => { // <-- Use official types
    const { name, email } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }
    
    db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message })
        } else {
          res.status(201).json({ 
            id: this.lastID, 
            name, 
            email, 
            message: 'User created successfully' 
          })
        }
      }
    )
  })
  
  app.delete('/api/users/:id', (req: Request, res: Response) => { // <-- Use official types
    const { id } = req.params
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.json({ 
          changes: this.changes, 
          message: 'User deleted successfully' 
        })
      }
    })
  })
  
  // Settings API
  app.get('/api/settings', async (req: Request, res: Response) => { // <-- Use official types
    try {
      // Ensure database is ready
      await getDatabaseReady()
      
      db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) {
          console.error('Database error:', err.message)
          res.status(500).json({ error: err.message })
        } else {
          res.json(rows)
        }
      })
    } catch (error) {
      console.error('Settings API error:', error)
      res.status(500).json({ error: 'Database not ready' })
    }
  })
  
  app.put('/api/settings/:key', async (req: Request, res: Response) => { // <-- Use official types
    try {
      // Ensure database is ready
      await getDatabaseReady()
      
      const { key } = req.params
      const { value } = req.body
      
      db.run(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [value, key],
        function(err) {
          if (err) {
            console.error('Database error:', err.message)
            res.status(500).json({ error: err.message })
          } else {
            res.json({ 
              key, 
              value, 
              message: 'Setting updated successfully' 
            })
          }
        }
      )
    } catch (error) {
      console.error('Settings update API error:', error)
      res.status(500).json({ error: 'Database not ready' })
    }
  })
  
  // File upload endpoint example
  app.post('/api/upload', (req: Request, res: Response) => { // <-- Use official types
    // Handle file uploads here
    res.json({ message: 'File upload endpoint ready' })
  })
  
  // Start server on available port
  server = app.listen(0, 'localhost', () => {
    const address = server.address()
    if (address && typeof address !== 'string') {
        serverPort = address.port
        console.log(`Express server running on http://localhost:${serverPort}`)
    }
  })
  
  return server
}

// IPC handler to get server port
ipcMain.handle('get-server-port', () => {
  return serverPort
})

export function stopExpressServer() {
  if (server) {
    server.close()
  }
}