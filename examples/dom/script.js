import { changeLabel, appendInput } from './example';

const $input  = document.querySelector('input');
const $button = document.querySelector('button');
const $output = document.querySelector('output');

$button.addEventListener('click', appendInput($input, $output));
$input.addEventListener('input', changeLabel($button));
