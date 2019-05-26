import { handleClick, createVDOM } from './example';
import { render } from '../../src/vdom/vdom';

const $table = document.querySelector('table');
const $button = document.querySelector('button');

$table.append(render(createVDOM(['Puerro'])));

$button.addEventListener('click', handleClick($table));
