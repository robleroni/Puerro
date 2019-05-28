<p align='center'>
  <img src='assets/img/puerro.png' width='100'>
</p>
<p align='center'>
  <img alt='mit' src='https://img.shields.io/badge/License-MIT-blue.svg'>
  <img alt='dependnecies' src='https://david-dm.org/robin-fhnw/IP5-Puerro.svg'>
  <img alt='build' src='https://travis-ci.org/robin-fhnw/IP5-Puerro.svg?branch=master'>
  <img alt='npm' src='https://img.shields.io/npm/dt/puerro.svg'>
</p>

# Puerro Project

Knowledge acquisition about how to build modern frontend web applications as simple as possible by researching different approaches.
It can be used as a [knowledge base](docs) or in combination with the provided [abstractions](src).

## Folder Structure

| Folder                 | Description                   |
| ---------------------- | ----------------------------- |
| [docs/](docs/)         | Documentation / Toolbox       |
| [src/](src/)           | Abstractions / Utilities      |
| [examples/](examples/) | Examples for the Abstractions |
| [huerto/](huerto/)     | Research / Showcase Project   |
| [test/](test/)         | Test Results                  |


## Getting Started

```bash
npm install puerro
```

### Example

```js
import { Observable } from "puerro";

const Model = ({ name = '' } = {}) => ({ name: Observable(name) });

const View = (model, controller, $input, $output) => {
  const render = () => ($output.textContent = model.name.get().length);

  // View-Binding
  $input.addEventListener('input', event => controller.setName(event.target.value));

  // Model-Binding
  model.name.onChange(render);
};

const Controller = model => {
  const setName = name => model.name.set(name);
  return { setName };
};

// Usage
const model = Model();
const controller = Controller(model);
const view = View(model, controller,
  document.querySelector('input'),
  document.querySelector('output')
);
```

## Development

To install and work on Puerro locally:

```bash
git clone git@github.com:robin-fhnw/IP5-Puerro.git Puerro
cd Puerro
npm install     # install the dev dependency 'rollup'
npm start       # bundle the scripts and watch for changes
```
