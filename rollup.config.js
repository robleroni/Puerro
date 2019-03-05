
const fs = require('fs');
const path = require('path');

const entryPoint = 'script.js';
const huertoDir = path.join(__dirname, 'huerto');
const dirs = fs.readdirSync(huertoDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .filter(d => fs.existsSync(path.join(huertoDir, d.name, entryPoint)));

const configs = dirs.map(d => ({
  input: path.join(huertoDir, d.name, entryPoint),
  output: {
    name: 'huerto',
    file: path.join(huertoDir, d.name, 'bundle.js'),
    format: 'iife'
  }
}));

export default configs;