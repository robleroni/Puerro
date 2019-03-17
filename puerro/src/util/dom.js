/**
 * Creates a new HTMLElement
 * @param {string} tagName
 *
 * @returns {function(content): HTMLElement}
 */
export const createElement = (tagName, attributes = {}) => content => {
  const $element = document.createElement(tagName);
  $element.innerHTML = content;
  Object.keys(attributes).forEach(attribute => {
    $element.setAttribute(attribute, attributes[attribute]);
  });
  return $element;
};
