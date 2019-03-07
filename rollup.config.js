const fs = require('fs');
const path = require('path');

const configs = [];

const dirsToCheck = ['huerto', 'puerro', 'research', 'test'];
const allTestsFile = 'all.tests.js';
const testsEnding = '.test.js';
const entryPoints = ['script.js', testsEnding, allTestsFile];
const name = '_';
const format = 'iife';

const bundleOutputName = file => `dist/${delFileEnding(file)}.bundle.js`;
const delFileEnding = s => s.replace(/\.[^/.]+$/, '');

const createConfig = (d, f) => ({
  input: path.join(d, f),
  output: {
    file: path.join(d, bundleOutputName(f)),
    name,
    format,
  },
});

function fillConfigsFromFile(dir) {
  const dirContent = fs.readdirSync(dir, { withFileTypes: true });

  dirContent
    .filter(c => c.isDirectory())
    .forEach(d => fillConfigsFromFile(path.join(dir, d.name)));

  dirContent
    .filter(c => c.isFile())
    .filter(f => entryPoints.some(e => f.name.endsWith(e)))
    .forEach(f => configs.push(createConfig(dir, f.name)));
}

dirsToCheck.forEach(fillConfigsFromFile);

let testImports = `// Generated file\n\n`;
testImports += configs
  .filter(c => c.input.endsWith(testsEnding))
  .map(c => `import '../${c.input}';\n`)
  .join('');

console.log(configs);

fs.writeFileSync(path.join('test', allTestsFile), testImports);

export default configs;
