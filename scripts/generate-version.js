const fs = require('fs');
const path = require('path');

// Generate a version file with timestamp and git commit hash
const version = {
  buildId: Date.now().toString(),
  timestamp: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local-dev',
};

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const versionPath = path.join(publicDir, 'version.json');
fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));

console.log('✓ Generated version.json:', version);
