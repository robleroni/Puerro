/**
 * Creates a new HTMLElement
 * @param {string} tagName
 *
 * @returns {function(content): HTMLElement}
 */
export function createElement(tagName, attributes = {}) {
  const $el = document.createElement(tagName);
  Object.keys(attributes).forEach(attribute => {
    $el.setAttribute(attribute, attributes[attribute]);
  });
  return (content) => {
    $el.innerHTML = content;
    return $el;
  }
}
