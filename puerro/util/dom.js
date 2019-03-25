/**
 * Creates a new HTMLElement
 * @param {string} tagName
 *
 * @returns {function(content): HTMLElement}
 */
const createElement = (tagName, attributes = {}) => content => {
  const $element = document.createElement(tagName);
  if (content) {
    $element.innerHTML = content;
  }
  Object.keys(attributes).forEach(key => {
    if (typeof attributes[key] === 'function') {
      $element.addEventListener(key, attributes[key]);
    } else {
      $element.setAttribute(key, attributes[key]);
    }
  });
  return $element;
};

function changed(node1, node2) {
  const nodeChanged =
    typeof node1 !== typeof node2 ||
    ((typeof node1 === 'string' || typeof node1 === 'number') && node1 !== node2) ||
    node1.type !== node2.type;
  const attributesChanged =
    !!node1.attributes &&
    !!node2.attributes &&
    (Object.keys(node1.attributes).length !== Object.keys(node2.attributes).length ||
      Object.keys(node1.attributes).some(a => !node2.attributes[a]) ||
      Object.keys(node1.attributes).some(a => node1.attributes[a] !== node2.attributes[a]));
  return nodeChanged || attributesChanged;
}

/**
 *
 * @param {HTMLElement} $parent
 * @param {object} oldNode
 * @param {object} newNode
 * @param {number} index
 */
const diff = ($parent, oldNode, newNode, index = 0) => {
  if (oldNode === null || oldNode === undefined) {
    $parent.appendChild(render(newNode));
  } else if (newNode === null || newNode === undefined) {
    $parent.removeChild($parent.childNodes[index]);
  } else if (changed(oldNode, newNode)) {
    $parent.replaceChild(render(newNode), $parent.childNodes[index]);
  } else if (newNode.tagName) {
    newNode.children.forEach((newNode, i) => {
      diff($parent.childNodes[index], oldNode.children[i], newNode, i);
    });
  }
};

/**
 * Creates a node object which can be rendered
 *
 * @param {string} tagName
 * @param {object} attributes
 * @param {any} node
 */
const h = (tagName, attributes, node) => {
  const children = node instanceof Array ? node : node != null ? [node] : [];

  return {
    tagName: tagName,
    attributes: attributes || {},
    children: children,
  };
};

/**
 * renders a given node object
 *
 * @param {object} node
 *
 * @returns {HTMLElement}
 */
const render = node => {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node);
  }
  const $element = createElement(node.tagName, node.attributes)('');
  node.children.forEach(c => $element.appendChild(render(c)));
  return $element;
};

/**
 * renders given stateful view into given container
 *
 * @param {HTMLElement} $root
 * @param {function(): object} view
 * @param {object} initialState
 */
const mount = ($root, view, initialState) => {
  const setState = newState => {
    state = { ...state, ...newState };
    const newVDom = view(state, setState);
    diff($root, vDom, newVDom);
    vDom = newVDom;
  };

  let state = initialState;
  let vDom = view(state, setState);
  $root.innerHTML = '';
  $root.appendChild(render(vDom));
};

export { h, mount, createElement, diff, changed };
