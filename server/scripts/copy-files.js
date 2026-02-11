import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

const dirsToExclude = ['core'];

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    const stat = fs.statSync(srcFile);
    
    if (stat.isDirectory()) {
      copyDirSync(srcFile, destFile);
    } else if (file.endsWith('.js')) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

function buildStructure() {
  try {
    const items = fs.readdirSync(srcDir);
    
    items.forEach(item => {
      const srcPath = path.join(srcDir, item);
      const distPath = path.join(distDir, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory() && !dirsToExclude.includes(item)) {
        copyDirSync(srcPath, distPath);
        console.log(`✓ Copiado: ${item}/`);
      } else if (stat.isFile() && item.endsWith('.js')) {
        fs.copyFileSync(srcPath, distPath);
        console.log(`✓ Copiado: ${item}`);
      }
    });
    
    console.log('✓ Estructura de dist preparada para deployment');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

buildStructure();
