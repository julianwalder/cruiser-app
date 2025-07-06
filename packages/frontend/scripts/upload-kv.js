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
      files.push(relativePath);
    }
  }
  
  return files;
}

function createCanonicalKey(filePath) {
  // Extract the base name without hash
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  
  // Remove hash from filename (hash is typically 8-12 characters after a dot)
  const nameWithoutHash = baseName.replace(/\.[a-f0-9]{8,12}$/, '');
  
  // Reconstruct canonical path
  const canonicalPath = path.join(dir, nameWithoutHash + ext);
  
  return canonicalPath;
}

function generateKVData() {
  if (!fs.existsSync(distPath)) {
    console.error('Dist directory does not exist. Please run build first.');
    process.exit(1);
  }

  const files = walkDir(distPath);
  const kvData = {};

  for (const file of files) {
    const filePath = path.join(distPath, file);
    const content = readFileAsBase64(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(file).toLowerCase();
    let contentType = 'text/plain';
    
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.ico') contentType = 'image/x-icon';
    else if (ext === '.woff') contentType = 'font/woff';
    else if (ext === '.woff2') contentType = 'font/woff2';
    else if (ext === '.ttf') contentType = 'font/ttf';
    else if (ext === '.eot') contentType = 'application/vnd.ms-fontobject';
    
    // Create the main entry with the hashed filename
    kvData[file] = {
      value: content,
      metadata: {
        contentType: contentType
      }
    };
    
    // Create canonical keys for HTML files and important assets
    if (ext === '.html' || ext === '.ico' || ext === '.svg') {
      const canonicalKey = createCanonicalKey(file);
      if (canonicalKey !== file) {
        kvData[canonicalKey] = {
          value: content,
          metadata: {
            contentType: contentType
          }
        };
        console.log(`Created canonical key: ${canonicalKey} -> ${file}`);
      }
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(kvData, null, 2));
  console.log(`Generated KV data with ${Object.keys(kvData).length} entries`);
  console.log(`Output saved to: ${outputPath}`);
}

generateKVData(); 