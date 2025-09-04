#!/usr/bin/env node

/**
 * Script to organize native modules for Electron distribution
 * Similar to electron-react-boilerplate pattern but with better organization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const NATIVE_MODULES = [
  {
    name: 'sqlite3',
    sourcePattern: 'node_modules/sqlite3/build/Release/**/*.node',
    targetDir: 'assets/native-modules/sqlite3'
  }
  // Add more native modules here as needed
  // {
  //   name: 'bcrypt',
  //   sourcePattern: 'node_modules/bcrypt/build/Release/**/*.node', 
  //   targetDir: 'assets/native-modules/bcrypt'
  // },
  // {
  //   name: 'serialport',
  //   sourcePattern: 'node_modules/@serialport/bindings-cpp/build/Release/**/*.node',
  //   targetDir: 'assets/native-modules/serialport'
  // }
];

function copyFileSync(source, target) {
  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

function organizeNativeModules() {
  console.log('🔧 Organizing native modules for distribution...');
  
  // Ensure assets directory exists
  const assetsDir = path.join(projectRoot, 'assets');
  const nativeModulesDir = path.join(assetsDir, 'native-modules');
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  if (!fs.existsSync(nativeModulesDir)) {
    fs.mkdirSync(nativeModulesDir, { recursive: true });
  }

  let modulesFound = 0;
  
  NATIVE_MODULES.forEach(module => {
    const sourceDir = path.join(projectRoot, path.dirname(module.sourcePattern.replace('/**/*.node', '')));
    
    if (fs.existsSync(sourceDir)) {
      console.log(`📦 Found ${module.name} native module`);
      
      // Ensure target directory exists
      const targetDir = path.join(projectRoot, module.targetDir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy native binaries
      try {
        if (fs.lstatSync(sourceDir).isDirectory()) {
          const files = fs.readdirSync(sourceDir);
          files.forEach(file => {
            if (file.endsWith('.node') || file.endsWith('.dll')) {
              const sourcePath = path.join(sourceDir, file);
              const targetPath = path.join(targetDir, file);
              copyFileSync(sourcePath, targetPath);
              console.log(`   ✅ Copied ${file}`);
            }
          });
        }
        modulesFound++;
      } catch (error) {
        console.warn(`   ⚠️  Warning: Could not copy ${module.name} binaries:`, error.message);
      }
    } else {
      console.log(`   ⚠️  ${module.name} not found (may need rebuilding)`);
    }
  });
  
  if (modulesFound > 0) {
    console.log(`✅ Successfully organized ${modulesFound} native modules`);
    console.log('📁 Native modules available in: assets/native-modules/');
  } else {
    console.log('ℹ️  No native modules found. Run "npm run rebuild" first if needed.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  organizeNativeModules();
}

export { organizeNativeModules };