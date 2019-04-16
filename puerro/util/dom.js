/**
 * A Module that abstracts DOM interactions.
 * It's purpose is to perform actions on the DOM like creating and mounting elements
 *
 * @module dom
 */

import { changed } from './vdom';

export { createElement, mount, mountWithActions, render };

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
  const $element = createElement(node.tagName, node.attributes)('');
  node.children.forEach(c => $element.appendChild(render(c)));
  return $element;
};

/**
 * compares two VDOM nodes and applies the differences to the dom
 *
 * @param {HTMLElement} $parent
 * @param {import('./vdom').VNode} oldNode
 * @param {import('./vdom').VNode} newNode
 * @param {number} index
 */
const diff = ($parent, oldNode, newNode, index = 0) => {
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
      diff($parent.childNodes[index], oldNode.children[i], newNode, i);
    });
  }
};

/**
 * renders given stateful view into given container
 *
 * @param {HTMLElement} $root
 * @param {function(): import('./vdom').VNode} view
 * @param {object} initialState
 * @param {boolean} useDiffing
 */
const mount = ($root, view, initialState, useDiffing = true) => {
  let _state = initialState;

  const setState = newState => {
    _state = { ..._state, ...newState };
    const newVDom = view(viewParams);
    if (useDiffing) {
      diff($root, vDom, newVDom);
    } else {
      $root.replaceChild(render(newVDom), $root.firstChild);
    }
    vDom = newVDom;
  };

  const viewParams = {
    get state() {
      return _state;
    },
    setState: setState,
  };
  let vDom = view(viewParams);
  if ($root.firstChild) {
    $root.replaceChild(render(vDom), $root.firstChild);
  } else {
    $root.appendChild(render(vDom));
  }
};

/**
 * renders given stateful view into given container
 *
 * @param {HTMLElement} $root
 * @param {function(): import('./vdom').VNode} view
 * @param {object} initialState
 * @param {boolean} useDiffing
 */
const mountWithActions = ($root, view, initialState, useDiffing = true) => {
  let _state = initialState;

  const refresh = () => {
    const newVDom = view(viewParams);

    if (useDiffing) {
      diff($root, vDom, newVDom);
    } else {
      $root.replaceChild(render(newVDom), $root.firstChild);
    }
    vDom = newVDom;
  };

  const act = action => {
    _state = action(_state, event) || _state;
    refresh();
  };

  const viewParams = {
    get state() {
      return _state;
    },
    act: act,
  };
  let vDom = view(viewParams);
  if ($root.firstChild) {
    $root.replaceChild(render(vDom), $root.firstChild);
  } else {
    $root.appendChild(render(vDom));
  }
};
