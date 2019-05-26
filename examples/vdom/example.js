
import { h, diff, toVDOM } from '../../src/vdom/vdom';

export { createVDOM, handleClick };

const createVDOM = items => h('tbody', {}, 
  items.map(item =>  h('tr', { class: 'row' }, h('td', { class: 'item' }, item)))
); 

const handleClick = $table => _ => {
  const items = ['Puerro', 'Huerto']; // items could be fetched from API's, DOM elements or others
  const vDOM = createVDOM(items);
  diff($table, vDOM, toVDOM($table.firstElementChild))
  return vDOM;
}
