import { createDomElement } from '../../src/vdom/vdom';

export { appendInput, changeLabel };

/**
 * Appends 'P' element to given output element.
 * 
 * @param {HTMLInputElement} $input element to get input from
 * @param {HTMLElement} $output element to append input to
 */
const appendInput = ($input, $output) => _ => {
  const $element = createDomElement('p', {}, $input.value);
  $output.append($element);
  return $element; // return for testing purposes
};

/**
 * Changes the label of the given button
 * 
 * @param {HTMLButtonElement} $button to change label
 */
const changeLabel = $button => event => {
  $button.textContent = 'Save: ' + event.target.value;
};
