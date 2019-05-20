<p align='center'>
  <img src='assets/img/puerro.png' width='100'>
</p>
<p align='center'>
  <img src='https://img.shields.io/badge/License-MIT-blue.svg'>
  <img src='https://david-dm.org/robin-fhnw/IP5-Puerro.svg'>
  <img src='https://travis-ci.org/robin-fhnw/IP5-Puerro.svg?branch=master'>
</p>

# Puerro Project

Knowledge acquisition about how to build modern frontend web applications as simple as possible by researching different approaches.
It can be used as a [knowladge base](docs) or in combination with the provided [abstractions](src).

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
import { Observable, render, h } from 'puerro';

const observable = Observable();

observable.onChange(value => document.body.prepend(render(h('p', {}, value))));
observable.set('Puerro');
```

## Development

To install and work on Puerro locally:

```bash
git clone git@github.com:robin-fhnw/IP5-Puerro.git Puerro
cd Puerro
npm install     # install the dev dependency 'rollup'
npm start       # bundle the scripts and watch for changes
```
