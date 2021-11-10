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
let packageJSON = null;

try {
  packageJSON = JSON.parse(packageFile);
} catch (e) {
  console.error(e);
}

if (!packageJSON) {
  console.log('[!] Failed to get version of react-native');
  process.exit(1);
}

const patchDir = packageJSON.version;
const isPatchExists = patchDir !== '' && fs.existsSync(`${rootPath}/patches/${patchDir}`);
if (!isPatchExists) {
  const supportVersions = fs.readdirSync(`${rootPath}/patches`).filter(dir => dir.match(/^\d/)).join(', ');
  console.log(`[!] Unsupported react-native version! (${patchDir})`);
  console.log(`[!] Supported react-native versions: ${supportVersions}`);
  process.exit(1);
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (file === '.DS_Store') {
      return;
    }

    const filePath = `${dirPath}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
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
