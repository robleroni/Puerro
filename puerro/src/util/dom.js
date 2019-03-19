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
 *
 * @returns {HTMLElement}
 */
const render = node => {
  if (typeof node === "string" ||
    typeof node === "number") {
    return document.createTextNode(node);
  }
  const $element = createElement(node.tagName, node.attributes)('');
  node.children.forEach(c => $element.appendChild(render(c)));
  return $element;
}

/**
 * renders given stateful view into given container
 *
 * @param {HTMLElement} $root
 * @param {function(): object} view
 * @param {object} initialState
 */
const mount = ($root, view, initialState) =>  {
  const refresh = () => {
    const newView = render(view(state, setState));
    $root.replaceChild(newView, place);
    place = newView;
  }

  const setState = (newState) => {
    state = {...state, ...newState};
    refresh();
  }

  let state = initialState;
  let place = render(view(state, setState));
  $root.appendChild(place);
}

export { h, mount, createElement }