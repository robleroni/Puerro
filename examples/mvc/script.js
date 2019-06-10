import { Model, View, Controller } from './example';

const model = Model();
const controller = Controller(model);
const view = View(model,
  controller,
  document.getElementById('form'),
  document.getElementById('output')
);