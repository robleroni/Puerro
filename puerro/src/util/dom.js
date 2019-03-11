/**
 * Creates a new HTMLElement
 * @param {string} tagName
 *
 * @returns {function(content): HTMLElement}
 */
export function createElement(tagName) {
  const $el = document.createElement(tagName);
  return (content) => {
    $el.innerHTML = content;
    return $el;
  }
}
