/**
 * Creates a new HTMLElement
 * @param {string} tagName
 *
 * @returns {function(content): HTMLElement}
 */
const createElement = (tagName, attributes = {}) => content => {
  const $element = document.createElement(tagName);
  $element.innerHTML = content;
  Object.keys(attributes).forEach(key => {
    if (typeof attributes[key]  === "function") {
      $element.addEventListener(key, attributes[key]);
    } else {
      $element.setAttribute(key, attributes[key]);
    }
  });
  return $element;
};

/**
 * Creates a node object which can be rendered
 *
 * @param {string} tagName
 * @param {object} attributes
 * @param {any} node
 */
const h = (tagName, attributes, node) => {
  const children =
  node instanceof Array
    ? node
    : node != null ? [node] : [];

  return {
    tagName:    tagName,
    attributes: attributes || {},
    children:   children
  }
}

/**
 * renders a given node object
 *
 * @param {object} node
 */
const render = node => {
  if (typeof node === "string" ||
    typeof node === "number") {
    return document.createTextNode(node)
  }
  const $element = createElement(node.tagName, node.attributes)('');
  node.children.forEach(c => $element.appendChild(render(c)));
  return $element;
}

/**
 * renders given view into given container
 *
 * @param {HTMLElement} $root
 * @param {function(): object} view
 */
const createView = ($root, view) => {
  $root.appendChild(render(view()));
}

export { h, createView, createElement }