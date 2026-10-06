#!/usr/bin/env node
// Replace hardcoded hex colors with palette references in .tsx files
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '..', 'src');

const hexMap = {
  '#15803d': 'palette.success[700]',
  '#16a34a': 'palette.success[600]',
  '#22c55e': 'palette.success[500]',
  '#2c4329': 'palette.primary[900]',
  '#338078': 'palette.secondary[600]',
  '#385539': 'palette.primary[800]',
  '#429e94': 'palette.secondary[500]',
  '#476e49': 'palette.primary[700]',
  '#588a5a': 'palette.primary[600]',
  '#5bb5ab': 'palette.secondary[400]',
  '#6fa671': 'palette.primary[500]',
  '#8FBC8F': 'palette.primary[400]',
  '#92400e': 'palette.warning[800]',
  '#a3c9a5': 'palette.primary[300]',
  '#b45309': 'palette.warning[700]',
  '#bbf7d0': 'palette.success[200]',
  '#c25c20': 'palette.accent[600]',
  '#c7dec8': 'palette.primary[200]',
  '#d8f2ee': 'palette.secondary[100]',
  '#d9732a': 'palette.accent[500]',
  '#d97706': 'palette.warning[600]',
  '#dcfce7': 'palette.success[100]',
  '#e3eee3': 'palette.primary[100]',
  '#e8933f': 'palette.accent[400]',
  '#ef4444': 'palette.error[500]',
  '#f59e0b': 'palette.warning[500]',
  '#fbe9d4': 'palette.accent[100]',
  '#fde68a': 'palette.warning[200]',
  '#fdf7f0': 'palette.accent[50]',
  '#fed7aa': 'palette.accent[200]',
  '#fee2e2': 'palette.error[100]',
  '#fef3c7': 'palette.warning[100]',
  '#ffffff': 'palette.neutral[50]',
  '#fff': 'palette.neutral[50]',
};

const rgbaMap = {
  'rgba(0,0,0,0.04)': 'shadows.sm',
  'rgba(0,0,0,0.05)': 'shadows.sm',
  'rgba(0,0,0,0.06)': 'shadows.md',
  'rgba(0,0,0,0.08)': 'shadows.md',
  'rgba(0,0,0,0.15)': 'shadows.lg',
  'rgba(0,0,0,0.2)': 'shadows.lg',
  'rgba(0,0,0,0.3)': 'shadows.xl',
};

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;
  let needsPalette = false;
  let needsShadows = false;

  if (filePath.includes('theme.ts') || filePath.includes('exportData') || filePath.includes('notifications')) {
    return { changed: false, needsPalette: false, needsShadows: false };
  }

  for (const [hex, ref] of Object.entries(hexMap)) {
    const escapedHex = hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace single-quoted: '#hex' -> palette.xxx[n]
    const singleRegex = new RegExp(`'${escapedHex}'`, 'gi');
    if (singleRegex.test(content)) {
      content = content.replace(new RegExp(`'${escapedHex}'`, 'gi'), ref);
      needsPalette = true;
    }

    // Replace double-quoted: "#hex" -> palette.xxx[n]
    const doubleRegex = new RegExp(`"${escapedHex}"`, 'gi');
    if (doubleRegex.test(content)) {
      content = content.replace(new RegExp(`"${escapedHex}"`, 'gi'), ref);
      needsPalette = true;
    }

    // Replace prop syntax: ="#hex" -> ={palette.xxx[n]}
    const propRegex = new RegExp(`="${escapedHex}"`, 'gi');
    if (propRegex.test(content)) {
      content = content.replace(new RegExp(`="${escapedHex}"`, 'gi'), `={${ref}}`);
      needsPalette = true;
    }
  }

  for (const [rgba, ref] of Object.entries(rgbaMap)) {
    const escapedRgba = rgba.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const singleRegex = new RegExp(`'${escapedRgba}'`, 'gi');
    if (singleRegex.test(content)) {
      content = content.replace(new RegExp(`'${escapedRgba}'`, 'gi'), ref);
      needsShadows = true;
    }
    const doubleRegex = new RegExp(`"${escapedRgba}"`, 'gi');
    if (doubleRegex.test(content)) {
      content = content.replace(new RegExp(`"${escapedRgba}"`, 'gi'), ref);
      needsShadows = true;
    }
  }

  return { changed: content !== original, needsPalette, needsShadows, content };
}

const files = walkDir(SRC_DIR);
const results = [];

for (const file of files) {
  const result = processFile(file);
  if (result.changed) {
    results.push({ file, needsPalette: result.needsPalette, needsShadows: result.needsShadows, content: result.content });
    console.log(`Updated: ${file.replace(SRC_DIR, 'src')}`);
  }
}

// Second pass: add imports
for (const { file, needsPalette, needsShadows, content: newContent } of results) {
  let content = newContent;
  
  const themeImportRegex = /import\s+\{([^}]+)\}\s+from\s+'@\/constants\/theme'/;
  const match = content.match(themeImportRegex);
  
  if (match) {
    let imports = match[1];
    if (needsPalette && !imports.includes('palette')) {
      imports = imports.trim() + ', palette';
    }
    if (needsShadows && !imports.includes('shadows')) {
      imports = imports.trim() + ', shadows';
    }
    content = content.replace(themeImportRegex, `import { ${imports} } from '@/constants/theme'`);
  } else {
    const newImports = [];
    if (needsPalette) newImports.push('palette');
    if (needsShadows) newImports.push('shadows');
    const importLine = `import { ${newImports.join(', ')} } from '@/constants/theme';\n`;
    
    const lastImportMatch = content.match(/^import.*$/gm);
    if (lastImportMatch && lastImportMatch.length > 0) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + '\n' + importLine.trim());
    } else {
      content = importLine + content;
    }
  }
  
  writeFileSync(file, content, 'utf-8');
}

console.log(`\nTotal files changed: ${results.length}`);
