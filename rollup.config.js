// using node to generate an all.tests.js file
// by scanning the directory structure recursively for test files

const fs   = require('fs');
const path = require('path');

const configs = [];

const dirsToCheck  = ['huerto', 'puerro', 'research', 'test'];
const allTestsFile = 'all.tests.js';
const testsEnding  = '.test.js';
const entryPoints  = ['script.js', testsEnding, allTestsFile];
const name         = '_';
const format       = 'iife';

const bundleOutputName = file => `dist/${delFileEnding(file)}.bundle.js`;
const delFileEnding    = name => name.replace(/\.[^/.]+$/, '');  // delete from last dot after the last slash until end

const createConfig = (dir, filename) => ({
  input:  path.join(dir, filename),
  output: {
    file: path.join(dir, bundleOutputName(filename)),
    name,
    format,
  },
});

const fillConfigsFromFile = dir => {
  const dirContent = fs.readdirSync(dir, { withFileTypes: true });

  dirContent
    .filter (d => d.isDirectory())
    .forEach(d => fillConfigsFromFile(path.join(dir, d.name))); // recursive descent into subdirs DFS

  dirContent
    .filter (f => f.isFile())
    .filter (f => entryPoints.some(e => f.name.endsWith(e)))
    .forEach(f => configs.push(createConfig(dir, f.name)));
};

dirsToCheck.forEach(fillConfigsFromFile);

let testImports = `// Generated file\n\n`;
testImports += configs
  .filter(c => c.input.endsWith(testsEnding))
  .map   (c => `import '../${c.input}';\n`)
  .join  ('');

console.log(configs);

fs.writeFileSync(path.join('test', allTestsFile), testImports);

export default configs;
