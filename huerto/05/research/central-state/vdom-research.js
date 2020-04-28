import { render, diff } from '../../../../src/vdom/vdom';

export {
  mount
}

const h = params => (tagName, attributes = {}, ...nodes) => {
  if (typeof tagName === 'function') {
    return tagName(params)(h(params));
  }
  return {
    tagName,
    attributes: null == attributes ? {} : attributes,
    children: null == nodes ? [] : [].concat(...nodes), // collapse nested arrays.
  }
};


/**
 * Renders given stateful view into given container
 *
 * @param {HTMLElement} $root
 * @param {function(): import('./vdom').VNode} view
 * @param {object} state
 * @param {boolean} diffing
 */
const mount = ($root, view, initialState, diffing = true) => {
  let _state = initialState;
  const params = {
    get state() {
      return _state;
    },
    setState,
  };

  let vDom = view(params)(h(params));
  $root.prepend(render(vDom));

  function setState(newState) {
    if (typeof newState === 'function') {
      _state = newState(_state) || _state;
    } else {
      _state = { ..._state, ...newState };
    }
    refresh();
  }

  function refresh() {
    const newVDom = view(params)(h(params));

    if (diffing) {
      diff($root, newVDom, vDom);
    } else {
      $root.replaceChild(render(newVDom), $root.firstChild);
    }

    vDom = newVDom;
  }
}