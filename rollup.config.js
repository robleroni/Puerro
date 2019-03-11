// using node to generate the bundles and an all.tests.js file
// by scanning the directory structure recursively for test files

const fs   = require('fs');

const configs = [];

const dirsToCheck         = ['huerto', 'puerro', 'research', 'test'];
const testFolder          = 'test';
const allTestsFile        = 'all.tests.js';
const testsEnding         = '.test.js';
const entryPoints         = ['script.js', testsEnding, allTestsFile];
const configOutputName    = '_';
const configOutputFormat  = 'iife';

const bundleOutputName = file => `dist/${delFileEnding(file)}.bundle.js`;
const delFileEnding    = name => name.replace(/\.[^/.]+$/, '');  // delete from last dot after the last slash until end

const createConfig = (dir, filename) => ({
  input:  `${dir}/${filename}`,
  output: {
    file: `${dir}/${bundleOutputName(filename)}`,
    name: configOutputName,
    format: configOutputFormat,
  },
});

const fillConfigsFromDir = dir => {
  const dirContent = fs.readdirSync(dir, { withFileTypes: true });

  dirContent
    .filter (d => d.isDirectory())
    .forEach(d => fillConfigsFromDir(`${dir}/${d.name}`)); // recursive descent into subdirs DFS

  dirContent
    .filter (f => f.isFile())
    .filter (f => entryPoints.some(e => f.name.endsWith(e)))
    .forEach(f => configs.push(createConfig(dir, f.name)));
};

dirsToCheck.forEach(fillConfigsFromDir);

let testImports = `// Generated file\n\n`;
testImports += configs
  .filter(c => c.input.endsWith(testsEnding))
  .map   (c => `import '../${c.input}';\n`)
  .join  ('');

fs.writeFileSync(`${testFolder}/${allTestsFile}`, testImports);

configs.push(createConfig(testFolder, allTestsFile)); 

export default configs;
