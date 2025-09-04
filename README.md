# Electron + Vite + React App

A modern, full-stack desktop application built with Electron, React, Vite, and TypeScript. Features SQLite database integration, AceBase NoSQL database, Express API server, secure file operations, and a beautiful glass morphism UI.

![Electron + Vite + React](https://img.shields.io/badge/Electron-28.1.0-47848F?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?style=for-the-badge&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-06B6D4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🚀 **Core Technologies**
- **Electron 28** - Cross-platform desktop application framework
- **React 18** - Modern UI with hooks and concurrent features
- **Vite 5** - Lightning-fast build tool with HMR
- **TypeScript** - Full type safety across main and renderer processes
- **Tailwind CSS** - Utility-first CSS with custom design system

### 🗄️ **Database Integration**
- **SQLite3** - Local relational database with full CRUD operations
- **AceBase NoSQL** - Document-based NoSQL database with hierarchical paths
- **Native Module Support** - Properly configured for cross-platform builds
- **IPC Database Bridge** - Secure communication between processes
- **Migration Support** - Database schema management

### 🌐 **Express API Server**
- **Embedded Server** - Express.js running in main process
- **RESTful APIs** - Complete CRUD endpoints for users and settings
- **CORS Support** - Cross-origin resource sharing enabled
- **Dynamic Port** - Automatic port assignment and discovery

### 📁 **File Operations**
- **Secure File Access** - Sandboxed file operations via IPC
- **Read/Write Support** - Text file manipulation capabilities
- **Native Dialogs** - System file dialogs and message boxes
- **Path Validation** - Cross-platform path handling

### 🎨 **Modern UI/UX**
- **Glass Morphism** - Beautiful translucent design effects
- **Dark Theme** - Professional dark mode optimized for desktop
- **Responsive Layout** - Adapts to different window sizes
- **Smooth Animations** - Fade-in effects and transitions
- **Custom Scrollbars** - Themed scrollbars for consistency

### 🔒 **Security**
- **Context Isolation** - Secure renderer process isolation
- **No Node Integration** - Sandboxed renderer for security
- **IPC Bridge** - Controlled communication via preload scripts
- **Type-Safe APIs** - TypeScript interfaces for all IPC operations

## 📁 Project Structure

```
your-project/
├── package.json                 # Dependencies and scripts
├── electron.vite.config.ts     # Electron-Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration (renderer)
├── tsconfig.node.json          # TypeScript configuration (build tools)
├── postcss.config.js           # PostCSS configuration
├── .eslintrc.cjs              # ESLint configuration
├── index.html                  # HTML template
├── .gitignore                 # Git ignore rules
├── scripts/
│   └── build_native.js        # Native module build script
├── electron/
│   ├── main.ts                # Main Electron process
│   ├── preload.ts             # Secure IPC bridge
│   ├── database.ts            # SQLite database integration
│   ├── acebase-db.ts          # AceBase NoSQL database integration
│   ├── express-server.ts      # Express API server
│   └── tsconfig.json          # TypeScript config (main process)
├── src/
│   ├── components/
│   │   ├── DatabaseDemo.tsx   # SQLite database operations demo
│   │   ├── AceBaseDemo.tsx    # AceBase NoSQL operations demo
│   │   ├── FileOperations.tsx # File system demo
│   │   └── ExpressServerDemo.tsx # API server demo
│   ├── types/
│   │   └── electron.d.ts      # Electron API type definitions
│   ├── App.tsx                # Main React application
│   ├── main.tsx               # React entry point
│   ├── index.css              # Global styles
│   └── App.css                # Component styles
└── public/
    └── electron-vite.svg      # Application icon
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd electron-vite-react-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Rebuild native modules** (if needed)
   ```bash
   npm run build:native
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will open automatically with hot reload enabled.

## 📜 Available Scripts

### Development
- `npm run dev` - Start development with hot reload
- `npm run dev:vite` - Start Vite dev server only
- `npm run dev:electron` - Start Electron (requires Vite server)

### Building
- `npm run build` - Build for production
- `npm run build:vite` - Build renderer process
- `npm run build:electron` - Build main process
- `npm run build:native` - Rebuild native modules

### Distribution
- `npm run dist` - Create platform-specific distributables
- `npm run dist:dir` - Create unpacked directory

### Quality Assurance
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗️ Architecture

### Main Process
The main process (`electron/main.ts`) handles:
- Window management and lifecycle
- Database initialization (SQLite and AceBase)
- Express server startup
- Native system integration
- IPC handler registration

### Renderer Process
The renderer process (`src/`) contains:
- React application with TypeScript
- Component-based architecture
- Tailwind CSS styling
- Secure IPC communication

### IPC Communication
Secure communication via preload script:
- Type-safe API definitions
- Context bridge isolation
- Error handling patterns
- Event cleanup management

## 🔥 AceBase NoSQL Database

### Features
- **Document-based storage** with hierarchical paths
- **Real-time operations** (get, set, push, update, remove)
- **Query capabilities** with filtering and ordering
- **JSON-native data types** and arrays
- **Auto-generated unique keys** for collections

### Usage Examples
```typescript
// Get data from a path
const result = await window.electronAPI.acebaseGet('users/demo-user')

// Set data at a path
await window.electronAPI.acebaseSet('users/new-user', {
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: Date.now()
})

// Push data to a collection (auto-generates key)
const result = await window.electronAPI.acebasePush('users', {
  name: 'Jane Smith',
  email: 'jane@example.com'
})

// Query data with options
const result = await window.electronAPI.acebaseQuery('users', {
  filter: { status: 'active' },
  limit: 10
})
```

## 🗄️ Database Schema

### SQLite Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### SQLite Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### AceBase Structure
```
myapp/
├── users/
│   ├── auto-generated-key/
│   │   ├── name: "Demo User"
│   │   ├── email: "demo@example.com"
│   │   └── status: "active"
│   └── demo-user-fixed/
│       ├── name: "Fixed Demo User"
│       └── email: "fixed@example.com"
├── settings/
│   ├── theme: "dark"
│   ├── language: "en"
│   └── notifications: true
└── demo/
    └── test-value/
        ├── testValue: "AceBase demo test..."
        └── timestamp: 1234567890
```

## 🌐 API Endpoints

The embedded Express server provides:

- `GET /api/health` - Server health check
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user
- `GET /api/settings` - Get application settings
- `PUT /api/settings/:key` - Update setting
- `POST /api/upload` - File upload endpoint

## ⚡ Hot Module Replacement (HMR)

### Features
- **Instant UI Updates** - Changes in React components reflect immediately
- **State Preservation** - Component state maintained during reloads
- **Fast Refresh** - Preserves component state while updating code
- **Main Process Reload** - Automatic reload when main process files change
- **Preload Script Reload** - Updates to preload scripts are automatically applied

### How It Works
1. Vite watches for file changes in the renderer process
2. Changed modules are hot-replaced without full page reload
3. Electron listens for build changes and reloads windows when needed
4. State is preserved through React Fast Refresh mechanisms

### Configuration
HMR is configured in `electron.vite.config.ts`:
```typescript
renderer: {
  server: {
    port: 5174,
    strictPort: true,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    }
  }
}
```

## 🎨 Theming

The application uses a custom design system with:

### Color Palette
- **Primary**: Blue variants (50-900)
- **Background**: Dark gradients
- **Text**: High contrast white/gray
- **Accents**: Green, purple, red for states

### Glass Morphism
- Translucent backgrounds
- Backdrop blur effects
- Subtle borders
- Layered depth

## 🔧 Configuration

### Electron-Vite Configuration
- React plugin integration
- TypeScript support
- Path aliases (`@/` → `src/`)
- Electron optimization
- Hot Module Replacement (HMR) configuration
- Multi-process build configuration (main, preload, renderer)

### Tailwind Configuration
- Custom color palette
- Content scanning
- Component extraction
- Responsive design

### TypeScript Configuration
- Strict mode enabled
- Path mapping
- Declaration files
- Source maps

## 📦 Building for Production

### Cross-Platform Builds
The project supports building for:

- **macOS**: DMG and ZIP packages (x64, arm64)
- **Windows**: NSIS installer, portable, AppX (x64, ia32)
- **Linux**: AppImage, DEB, RPM, Snap (x64, arm64)

### Native Module Handling
- SQLite3 and AceBase bindings included
- Platform-specific configurations
- Code signing support
- Auto-updater integration

### Build Commands
```bash
# Build for current platform
npm run dist

# Build for all platforms (requires appropriate setup)
npm run dist -- --mac --win --linux
```

## 🔒 Security

### Renderer Process
- Context isolation enabled
- Node integration disabled
- Sandboxed environment
- Secure IPC communication

### Native Modules
- Proper entitlements (macOS)
- Code signing certificates
- Hardened runtime
- Security permissions

## 🛠️ Development

### Hot Reload
- Vite HMR for renderer process
- Electron reload for main process
- Database persistence across reloads
- State preservation

### Debugging
- Chrome DevTools integration
- TypeScript source maps
- Console logging
- Error boundaries

### Testing
- TypeScript type checking
- ESLint code quality
- Manual testing workflow
- Component isolation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting guide](#troubleshooting)
2. Search existing issues
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [SQLite](https://www.sqlite.org/) - Database engine
- [AceBase](https://www.npmjs.com/package/acebase) - NoSQL database

## 🔄 Roadmap

- [ ] Unit testing setup
- [ ] E2E testing with Playwright
- [ ] CI/CD pipeline
- [ ] Auto-updater implementation
- [ ] Plugin system
- [ ] Multi-language support
- [ ] Performance optimization

---

**Built with ❤️ using modern web technologies**