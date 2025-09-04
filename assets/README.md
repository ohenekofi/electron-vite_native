# Assets Directory

This directory contains resources that will be bundled with the Electron application.

## Structure

```
assets/
├── native-modules/           # Organized native Node.js modules
│   ├── sqlite3/             # SQLite3 native bindings
│   │   └── node_sqlite3.node
│   ├── bcrypt/              # (Future) Bcrypt native bindings  
│   └── serialport/          # (Future) SerialPort native bindings
└── icons/                   # Application icons (future)
```

## Native Modules Organization

This project follows the electron-react-boilerplate pattern for organizing native modules:

1. **Automatic unpacking**: `asarUnpack: "**\\*.{node,dll}"` in package.json automatically excludes native binaries from ASAR
2. **Organized structure**: Native modules are copied to `assets/native-modules/` for easy management
3. **Scalable approach**: Adding new native modules only requires updating the `NATIVE_MODULES` array in `scripts/organize-native-modules.js`

## Usage

### Adding New Native Modules

1. Install the module: `npm install your-native-module`
2. Add to the `NATIVE_MODULES` array in `scripts/organize-native-modules.js`:
   ```javascript
   {
     name: 'your-module',
     sourcePattern: 'node_modules/your-module/build/Release/**/*.node',
     targetDir: 'assets/native-modules/your-module'
   }
   ```
3. Rebuild and organize: `npm run rebuild && npm run organize-native-modules`

### Build Process

1. `npm run rebuild` - Rebuilds native modules for Electron
2. `npm run organize-native-modules` - Copies native binaries to organized structure
3. `npm run dist` - Builds and packages the application

## Benefits

- **Clean organization**: All native modules in one place
- **Easy maintenance**: Clear structure for multiple native modules
- **Distribution ready**: Proper packaging for cross-platform distribution
- **Scalable**: Easy to add new native modules without complex configuration changes