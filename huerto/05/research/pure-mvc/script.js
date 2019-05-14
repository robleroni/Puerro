import { Controller, FormView, OutputView } from './mvc';

const controller = Controller();
const $form = document.getElementById('form');
const $output = document.getElementById('output');

FormView(controller, $form);
OutputView(controller, $output);