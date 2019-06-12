<p align='center'>
  <img src='assets/img/puerro.png' width='100'>
</p>
<p align='center'>
  <img alt='mit' src='https://img.shields.io/badge/License-MIT-blue.svg'>
  <img alt='dependnecies' src='https://david-dm.org/robin-fhnw/IP5-Puerro.svg'>
  <img alt='build' src='https://travis-ci.org/robin-fhnw/IP5-Puerro.svg?branch=master'>
  <img alt='npm' src='https://img.shields.io/npm/dt/puerro.svg'>
</p>

# Puerro

Knowledge acquisition about how to build modern frontend web applications as simple as possible by researching different approaches.

## Getting Started

It can be used as a [knowledge base](docs) ([GitBook](https://robin-christen.gitbook.io/puerro/)) or in combination with the provided [abstractions](src).

Also checkout our [examples](examples) or the [research showcase project](huerto).

### Install

Directly copy the desired [abstractions](src) in your project or use NPM to install Puerro fully:

```bash
npm install puerro
```

### Example Usage

```js
import { Observable } from 'puerro'; // bundler specific, or wherever source is located

const Model = ({ text = '' } = {}) => ({ text: Observable(text) });

const View = (model, controller, $input, $output) => {
  const render = () => ($output.textContent = model.text.get().length);

  // View-Binding
  $input.addEventListener('input', event => controller.setName(event.target.value));

  // Model-Binding
  model.text.onChange(render);
};

const Controller = model => {
  const setName = text => model.text.set(text);
  return { setName };
};

// Usage
const model      = Model();
const controller = Controller(model);
const view       = View(model, controller,
  document.querySelector('input'),
  document.querySelector('output')
);
```

## Developing

To install and work on Puerro locally:

```bash
git clone git@github.com:robin-fhnw/IP5-Puerro.git Puerro
cd Puerro
npm install     # install the dev dependency 'rollup'
npm start       # bundle the scripts and watch for changes
```

## Testing

The test results can be viewed [live](https://robin-fhnw.github.io/IP5-Puerro/test/AllTests.html)!

To run and display the tests locally:
```bash
npm test
```


