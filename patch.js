#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootPath = path.join(__dirname, '.');

// ============================================================================
// Get RN version
// ============================================================================
const RNRootPath = path.join(__dirname, '..', 'react-native');
const RNPackageFile = `${RNRootPath}/package.json`;
if (!fs.existsSync(RNPackageFile)) {
  console.log('[!] Not exists react-native');
  process.exit(1);
}

const packageFile = fs.readFileSync(RNPackageFile);
let package = null;

try {
  package = JSON.parse(packageFile);
} catch (e) {
  console.error(e);
}

if (!package) {
  console.log('[!] Failed to get version of react-native');
  process.exit(1);
}

const version = package.version.split('.');
const majorVersion = parseInt(version[0], 10);
const minorVersion = parseInt(version[1], 10);
const patchVersion = parseInt(version[2], 10);

let patchDir = '';
switch (minorVersion) {
  case 62:
    patchDir = '0.62.2';
    break;
  case 61:
    patchDir = '0.61.5';
    break;
  case 60:
    patchDir = '0.60.6';
    break;
  default:    
    break;
}

if (patchDir === '') {
  console.log('[!] Unsupported react-native version (>= 0.60)');
  process.exit(1);
}

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)
 
  arrayOfFiles = arrayOfFiles || []
 
  files.forEach(function(file) {
    if (file === '.DS_Store') {
      return;
    }

    const filePath = `${dirPath}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
    } else {
      arrayOfFiles.push(filePath);
    }
  })
 
  return arrayOfFiles
}

// ============================================================================
// Copy files
// ============================================================================
const targetFilesDir = `${rootPath}/patches/${patchDir}/files`;
getAllFiles(targetFilesDir).forEach(function(sourceFile) {
  const destFile = `${RNRootPath}${sourceFile.replace(targetFilesDir, '')}`;
  fs.copyFileSync(sourceFile, destFile);
});

// ============================================================================
// Copy Android library
// ============================================================================
const targetLibraryDir = `${rootPath}/patches/${patchDir}/library`;
getAllFiles(targetLibraryDir).forEach(function(sourceFile) {
  const destFile = `${RNRootPath}/android/com/facebook/react/react-native${sourceFile.replace(targetLibraryDir, '')}`;
  fs.copyFileSync(sourceFile, destFile);
});

console.log('[!] RN Netwokring module was patched!');
