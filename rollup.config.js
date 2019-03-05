const fs = require('fs');
const path = require('path');

const entryPoint = 'script.js';
const testFile = 'test.js';
const huertoDir = path.join(__dirname, 'huerto');
const dirs = fs
  .readdirSync(huertoDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .filter(d => fs.existsSync(path.join(huertoDir, d.name, entryPoint)));

const configs = dirs.map(d => ({
  input: path.join(huertoDir, d.name, entryPoint),
  output: {
    name: 'huerto',
    file: path.join(huertoDir, d.name, 'bundle.js'),
    format: 'iife',
  },
}));

configs.push({
  input: path.join(__dirname, 'test', 'allTests.js'),
  output: {
    name: 'tests',
    file: path.join(__dirname, 'test', 'bundle.js'),
    format: 'iife',
  },
});

let testImports = `// Generated file\n\n`;

function findTests(dir) {
  const dirs = fs.readdirSync(dir, { withFileTypes: true });
  dirs
    .filter(d => d.isDirectory())
    .filter(d => d.name !== 'node_modules' && d.name !== '.git')
    .forEach(d => findTests(path.join(dir, d.name)));

  testImports += dirs
    .filter(d => d.name.endsWith('.test.js'))
    .map(f => `import '../${dir}/${f.name}';\n`)
    .join('');

  console.log(testImports);
}
findTests('.');

fs.writeFileSync(path.join(__dirname, 'test', 'allTests.js'), testImports);

export default configs;
