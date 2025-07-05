import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');
const outputPath = path.join(__dirname, '../kv-data.json');

function readFileAsBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

function walkDir(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      const key = relativePath.replace(/\\/g, '/'); // Ensure forward slashes
      const value = readFileAsBase64(fullPath);
      
      files.push({
        key,
        value,
        base64: true
      });
    }
  }
  
  return files;
}

console.log('Reading dist folder...');
const kvData = walkDir(distPath);

console.log(`Found ${kvData.length} files to upload`);
console.log('Files:', kvData.map(item => item.key));

fs.writeFileSync(outputPath, JSON.stringify(kvData, null, 2));
console.log(`KV data written to ${outputPath}`); 