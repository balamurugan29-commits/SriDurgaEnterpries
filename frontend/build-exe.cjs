const { packager } = require('@electron/packager');
const path = require('path');
const fs = require('fs');

async function buildExe() {
  console.log('>>> [1/2] Preparing output directory...');
  const outDir = path.join(__dirname, '../dist-desktop');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('>>> [2/2] Packaging Standalone Windows .exe application...');
  const appPaths = await packager({
    dir: __dirname,
    name: 'Sri Durga Enterprises',
    platform: 'win32',
    arch: 'x64',
    out: outDir,
    overwrite: true,
    asar: true,
    prune: true,
    ignore: [
      /^\/src($|\/)/,
      /^\/\.git($|\/)/,
      /^\/dist-electron($|\/)/,
      /\.bat$/
    ]
  });

  console.log('\n================================================================');
  console.log('>>> [SUCCESS] Standalone Windows Desktop App created successfully!');
  console.log('>>> Location:', appPaths[0]);
  console.log('>>> Executable:', path.join(appPaths[0], 'Sri Durga Enterprises.exe'));
  console.log('================================================================\n');
}

buildExe().catch(err => {
  console.error('>>> [ERROR] Packaging failed:', err);
  process.exit(1);
});
