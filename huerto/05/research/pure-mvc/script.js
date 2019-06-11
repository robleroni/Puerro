import { FormView, OutputView, ErrorView } from './mvc';

const controller = Controller();
const $form      = document.getElementById('form');
const $output    = document.getElementById('output');
const $error     = document.getElementById('error');

FormView(controller, $form);
OutputView(controller, $output);
ErrorView(controller, $error);