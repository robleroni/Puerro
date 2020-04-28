// using node to generate the bundles and an all.tests.js file
// by scanning the directory structure recursively for test files

const fs = require('fs');
const resolve = require('rollup-plugin-node-resolve');

const configs = [];

const projects            = ['src', 'huerto', 'examples'];
const testFiles           = ['src.tests.js', 'huerto.tests.js', 'examples.tests.js'];
const allTestsFile        = 'all.tests.js';
const testFolder          = 'test';
const testsEnding         = '.test.js';
const entryPointEndings   = ['script.js', testsEnding];

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
  plugins: [
    resolve({
      mainFields: ['module', 'main'], // Default: ['module', 'main']
    }),
  ],
});

const fillConfigs = dir => {
  const dirContent = fs.readdirSync(dir, { withFileTypes: true });

  // descent recursive into subdirs
  dirContent
    .filter (d => d.isDirectory())
    .forEach(d => fillConfigs(`${dir}/${d.name}`)); // recursive descent into subdirs DFS

  // push entry points to configs
  dirContent
    .filter (f => f.isFile())
    .filter (f => entryPointEndings.some(e => f.name.endsWith(e)))
    .forEach(f => configs.push(createConfig(dir, f.name)));
};

projects.forEach(fillConfigs);

const generateTestBundle = testFile => {
  let testImports = `// Generated file\n\n`;

  testImports += configs
    .filter(c => c.input.startsWith(testFile.split('.')[0]))
    .filter(c => c.input.endsWith(testsEnding))
    .map   (c => `import '../${c.output.file}';\n`)
    .join  ('');

  fs.writeFileSync(`${testFolder}/${testFile}`, testImports);
  configs.push(createConfig(testFolder, testFile));
}

testFiles.forEach(generateTestBundle);

// Generate all.tests.js file
let testImports = `// Generated file\n\n`;
testImports += testFiles.map(file => `import './${file}';\n`).join('');
fs.writeFileSync(`${testFolder}/${allTestsFile}`, testImports);
configs.push(createConfig(testFolder, allTestsFile));

configs.push({
  input:  'src/index.js',
  output: {
    file: 'dist/puerro.module.js',
    format: 'esm',
    name: 'puerro'
  }
});

configs.push({
  input:  'src/index.js',
  output: {
    file: 'dist/puerro.js',
    format: 'cjs',
    name: 'puerro'
  }
});

export default configs;