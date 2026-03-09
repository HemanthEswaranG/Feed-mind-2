#!/usr/bin/env node

/**
 * Auto-converter script for TypeScript to JavaScript
 * Usage: node convert-ts-to-js.mjs <directory>
 */

import { readdir, readFile, writeFile, rename, stat } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Files to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'prisma',
];

function shouldSkip(path) {
  return SKIP_PATTERNS.some(pattern => path.includes(pattern));
}

function convertTypeScript(content) {
  let converted = content;

  // Remove type annotations from function parameters and variables
  converted = converted.replace(/: (string|number|boolean|any|void|null|unknown|never|Function|Object|Array<[^>]+>|Record<[^>]+>|\w+\[\])(\s*[,;=)])/g, '$2');
  
  // Remove generic type parameters
  converted = converted.replace(/<([A-Z][a-zA-Z0-9<>, |]*?)>/g, '');
  
  // Remove interface declarations
  converted = converted.replace(/^interface\s+\w+\s*\{[^}]*\}\s*$/gm, '');
  converted = converted.replace(/export interface\s+\w+\s*\{[^}]*\}\s*$/gm, '');
  
  // Remove type declarations
  converted = converted.replace(/^type\s+\w+\s*=\s*[^;]+;\s*$/gm, '');
  converted = converted.replace(/export type\s+\w+\s*=\s*[^;]+;\s*$/gm, '');
  
  // Remove type-only imports
  converted = converted.replace(/import type\s*\{[^}]+\}\s*from\s*[^;]+;?\s*$/gm, '');
  
  // Remove type assertions
  converted = converted.replace(/\s+as\s+(string|number|boolean|any|unknown|\w+)/g, '');
  
  // Update import extensions
  converted = converted.replace(/from\s+["']([^"']+)\.ts(x)?["']/g, 'from "$1.js$2"');
  converted = converted.replace(/from\s+["']([^"']+)["']/g, (match, p1) => {
    if (p1.startsWith('.') || p1.startsWith('@/')) {
      return match.replace(/["']$/, '.js$&');
    }
    return match;
  });
  
  // Fix JSX imports
  converted = converted.replace(/\.tsx\.js/g, '.jsx');
  converted = converted.replace(/\.ts\.jsx/g, '.jsx');
  
  // Remove readonly modifiers
  converted = converted.replace(/\breadonly\s+/g, '');
  
  // Remove access modifiers (public, private, protected)
  converted = converted.replace(/\b(public|private|protected)\s+/g, '');
  
  // Clean up multiple empty lines
  converted = converted.replace(/\n{3,}/g, '\n\n');
  
  return converted;
}

async function processFile(filePath) {
  try {
    const ext = extname(filePath);
    
    if (ext !== '.ts' && ext !== '.tsx') {
      return;
    }

    console.log(`Converting: ${filePath}`);
    
    const content = await readFile(filePath, 'utf-8');
    const converted = convertTypeScript(content);
    
    // Determine new extension
    const newExt = ext === '.tsx' ? '.jsx' : '.js';
    const newPath = filePath.replace(/\.tsx?$/, newExt);
    
    // Write converted content
    await writeFile(filePath, converted, 'utf-8');
    
    // Rename file
    if (newPath !== filePath) {
      await rename(filePath, newPath);
      console.log(`  ✓ Renamed to: ${newPath}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  if (shouldSkip(dirPath)) {
    return;
  }

  try {
    const items = await readdir(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      
      if (shouldSkip(fullPath)) {
        continue;
      }
      
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await processDirectory(fullPath);
      } else if (stats.isFile()) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
const targetDir = process.argv[2] || process.cwd();

console.log('╔═══════════════════════════════════════════════╗');
console.log('║  TypeScript to JavaScript Auto-Converter     ║');
console.log('╚═══════════════════════════════════════════════╝\n');
console.log(`Target directory: ${targetDir}\n`);

await processDirectory(targetDir);

console.log('\n✨ Conversion complete!\n');
console.log('Next steps:');
console.log('  1. Review converted files');
console.log('  2. Fix any remaining type issues manually');
console.log('  3. Update imports if needed');
console.log('  4. Test your application\n');
