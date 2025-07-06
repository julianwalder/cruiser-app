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
      files.push({
        path: relativePath,
        fullPath: fullPath,
        size: stat.size
      });
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
    console.error('Dist directory not found. Please run npm run build first.');
    process.exit(1);
  }

  const files = walkDir(distPath);
  const kvData = [];

  for (const file of files) {
    const content = readFileAsBase64(file.fullPath);
    
    // Determine content type based on file extension
    let contentType = 'text/plain';
    if (file.path.endsWith('.html')) {
      contentType = 'text/html';
    } else if (file.path.endsWith('.css')) {
      contentType = 'text/css';
    } else if (file.path.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (file.path.endsWith('.json')) {
      contentType = 'application/json';
    } else if (file.path.endsWith('.png')) {
      contentType = 'image/png';
    } else if (file.path.endsWith('.jpg') || file.path.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (file.path.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (file.path.endsWith('.ico')) {
      contentType = 'image/x-icon';
    }

    // Add the hashed filename entry
    kvData.push({
      key: file.path,
      value: content,
      metadata: {
        contentType: contentType,
        size: file.size
      }
    });

    // Create canonical keys for important files
    if (file.path.endsWith('.html')) {
      const canonicalKey = file.path.replace(/\.\w+\.html$/, '.html');
      if (canonicalKey !== file.path) {
        kvData.push({
          key: canonicalKey,
          value: content,
          metadata: {
            contentType: contentType,
            size: file.size
          }
        });
      }
    }

    // Special handling for index.html
    if (file.path === 'index.html') {
      kvData.push({
        key: '/',
        value: content,
        metadata: {
          contentType: contentType,
          size: file.size
        }
      });
    }
  }

  return kvData;
}

// Generate and save KV data
const kvData = generateKVData();
fs.writeFileSync(outputPath, JSON.stringify(kvData, null, 2));

console.log(`Generated KV data with ${kvData.length} entries`);
console.log(`Output saved to: ${outputPath}`);

// Log the canonical keys that were created
const canonicalKeys = kvData.filter(entry => 
  entry.key === 'index.html' || 
  entry.key === '/' || 
  entry.key.endsWith('/index.html')
).map(entry => entry.key);

if (canonicalKeys.length > 0) {
  console.log('\nCanonical keys created:');
  canonicalKeys.forEach(key => console.log(`  - ${key}`));
} 