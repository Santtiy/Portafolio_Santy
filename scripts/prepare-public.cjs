const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, 'public');

const copyTargets = ['index.html', 'styles.css', 'dist'];

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const copyPath = (sourcePath, targetPath) => {
  const stats = fs.statSync(sourcePath);

  if (stats.isDirectory()) {
    ensureDir(targetPath);
    const entries = fs.readdirSync(sourcePath);

    for (const entry of entries) {
      copyPath(path.join(sourcePath, entry), path.join(targetPath, entry));
    }
    return;
  }

  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
};

fs.rmSync(outputDir, { recursive: true, force: true });
ensureDir(outputDir);

for (const target of copyTargets) {
  const sourcePath = path.join(projectRoot, target);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing required build artifact: ${target}`);
  }

  const targetPath = path.join(outputDir, target);
  copyPath(sourcePath, targetPath);
}

console.log('Prepared Vercel output directory: public');
