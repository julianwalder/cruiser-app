import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');
const KV_NAMESPACE_ID = 'f810882156314ae6962a4523d719327c'; // Production STATIC_CONTENT

async function uploadAssets() {
  try {
    console.log('🚀 Starting KV asset upload...');
    console.log(`📁 Reading assets from: ${DIST_DIR}`);
    console.log(`🗂️  KV Namespace ID: ${KV_NAMESPACE_ID}`);

    // Read all files from dist directory recursively
    const files = await getAllFiles(DIST_DIR);
    
    console.log(`📦 Found ${files.length} files to upload:`);
    files.forEach(file => console.log(`  - ${file}`));

    // Upload each file to KV
    for (const filePath of files) {
      const relativePath = filePath.replace(DIST_DIR + '/', '');
      const content = await readFile(filePath);
      
      console.log(`⬆️  Uploading: ${relativePath} (${content.length} bytes)`);
      
      // Use wrangler CLI to upload the file
      const { execSync } = await import('child_process');
      execSync(`npx wrangler kv key put --namespace-id ${KV_NAMESPACE_ID} "${relativePath}" --path "${filePath}"`, {
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });
    }

    console.log('✅ KV asset upload completed successfully!');
  } catch (error) {
    console.error('❌ Error uploading assets to KV:', error);
    process.exit(1);
  }
}

async function getAllFiles(dir) {
  const files = [];
  
  async function scan(currentDir) {
    const items = await readdir(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(currentDir, item.name);
      
      if (item.isDirectory()) {
        await scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

uploadAssets(); 