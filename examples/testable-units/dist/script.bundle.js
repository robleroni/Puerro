(function () {
  'use strict';

  /**
   * A Module that abstracts Virtual DOM interactions.
   * It's purpose is to perform actions on DOM-like Objects
   *
   * @module vdom
   */

  /**
   * Creates a new HTML Element.
   * If the attribute is a function it will add it as an EventListener.
   * Otherwise as an attribute.
   *
   * @param {string} tagName name of the tag
   * @param {object} attributes attributes or listeners to set in element
   * @param {*} innerHTML content of the tag
   *
   * @returns {function(content): HTMLElement}
   */
  const createDomElement = (tagName, attributes = {}, innerHTML = '') => {
    const $element = document.createElement(tagName);
    $element.innerHTML = innerHTML;
    Object.keys(attributes)
      .filter(key => null != attributes[key]) // don't create attributes with value null/undefined
      .forEach(key => {
        if (typeof attributes[key] === 'function') {
          $element.addEventListener(key, attributes[key]);
        } else {
          $element.setAttribute(key, attributes[key]);
        }
      });
    return $element;
  };

  const appendInput = ($input, $output) => _ => {
    const $element = createDomElement('p', {}, $input.value);
    $output.append($element);
    return $element;
  };

  const changeLabel = $button => event => {
    $button.textContent = 'Save: ' + event.target.value;
  };

  const $input = document.querySelector('input');
  const $button = document.querySelector('button');
  const $output = document.querySelector('output');

  $button.addEventListener('click', appendInput($input, $output));
  $input.addEventListener('input', changeLabel($button));

}());
