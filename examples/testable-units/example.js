import { createDomElement } from '../../src/vdom/vdom';

export { appendInput, changeLabel };

const appendInput = ($input, $output) => _ => {
  const $element = createDomElement('p', {}, $input.value);
  $output.append($element);
  return $element;
};

const changeLabel = $button => event => {
  $button.textContent = 'Save: ' + event.target.value;
};
