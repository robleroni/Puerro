/**
 * A Module that abstracts DOM interactions.
 * It's purpose is to perform actions on the DOM like creating and mounting elements
 *
 * @module dom
 */

import { changed } from './vdom';

export { createDomElement, render, mount };

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
    .filter(key => null != attributes[key]) // don't render attributes with value null/undefined
    .forEach(key => {
      if (typeof attributes[key] === 'function') {
        $element.addEventListener(key, attributes[key]);
      } else {
        $element.setAttribute(key, attributes[key]);
      }
    });
  return $element;
};

/**
 * renders a given node object
 *
 * @param {import('./vdom').VNode} node
 *
 * @returns {HTMLElement}
 */
const render = node => {
  if (null == node) {
    return document.createTextNode('');
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node);
  }
  const $element = createDomElement(node.tagName, node.attributes);
  node.children.forEach(c => $element.appendChild(render(c)));
  return $element;
};

/**
 * Renders given stateful view into given container
 *
 * @param {HTMLElement} $root
 * @param {function(): import('./vdom').VNode} view
 * @param {object} state
 * @param {boolean} diffing
 */
const mount = ($root, view, state, diffing = true) => {
  let vDom = view({ state, setState });
  $root.prepend(render(vDom));

  function setState(newState) {
    if (typeof newState === 'function') {
      state = newState(state) || state;
    } else {
      state = { ...state, ...newState };
    }
    refresh();
  }

  function refresh() {
    const newVDom = view({ state, setState });

    if (diffing) {
      diff($root, newVDom, vDom);
    } else {
      $root.replaceChild(render(newVDom), $root.firstChild);
    }

    vDom = newVDom;
  }
};

/**
 * Compares two VDOM nodes and applies the differences to the dom
 *
 * @param {HTMLElement} $parent
 * @param {import('./vdom').VNode} oldNode
 * @param {import('./vdom').VNode} newNode
 * @param {number} index
 */
const diff = ($parent, newNode, oldNode, index = 0) => {
  if (null == oldNode) {
    $parent.appendChild(render(newNode));
    return;
  }
  if (null == newNode) {
    $parent.removeChild($parent.childNodes[index]);
    return;
  }
  if (changed(oldNode, newNode)) {
    $parent.replaceChild(render(newNode), $parent.childNodes[index]);
    return;
  }
  if (newNode.tagName) {
    newNode.children.forEach((newNode, i) => {
      diff($parent.childNodes[index], newNode, oldNode.children[i], i);
    });
  }
};
