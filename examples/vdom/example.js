
import { h, diff, toVDOM } from '../../src/vdom/vdom';

export { createVDOM, handleClick };

/**
 * Creates the virtual DOM based on the given items
 * 
 * @param {Array} items to create the vdom with
 */
const createVDOM = items => h('tbody', {}, 
  items.map(item =>  h('tr', { class: 'row' }, h('td', { class: 'item' }, item)))
); 

/**
 * Handles the button click
 * 
 * @param {HTMLTableElement} $table 
 */
const handleClick = $table => _ => {
  const items = ['Puerro', 'Huerto']; // items could be fetched from API's, DOM elements or others
  const vDOM = createVDOM(items);
  diff($table, vDOM, toVDOM($table.firstElementChild))
  return vDOM;
}
