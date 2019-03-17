/**
 * Creates a new HTMLElement
 * @param {string} tagName
 *
 * @returns {function(content): HTMLElement}
 */
export const createElement = (tagName, attributes = {}) => content => {
  const $el = document.createElement(tagName);
  $el.innerHTML = content;
  Object.keys(attributes).forEach(attribute => {
    $el.setAttribute(attribute, attributes[attribute]);
  });
  return $el;
};
