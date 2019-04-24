(function () {
  'use strict';

  /**
   * A Module that abstracts Virtual DOM interactions.
   * It's purpose is to perform actions on DOM-like Objects
   *
   * @module vdom
   */
  /**
   * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
   */

  /**
   * Creates a node object which can be rendered
   *
   * @param {string} tagName
   * @param {object} attributes
   * @param {VNode[] | VNode | any} node
   *
   * @returns {VNode}
   */
  const vNode = (tagName, attributes = {}, ...nodes) => ({
    tagName,
    attributes: null == attributes ? {} : attributes,
    children: null == nodes ? [] : [].concat(...nodes), // collapse nested arrays.
  });
  const h = vNode;

  /**
   * compares two VDOM nodes and returns true if they are different
   *
   * @param {VNode} node1
   * @param {VNode} node2
   */
  const changed = (node1, node2) => {
    const nodeChanged =
      typeof node1 !== typeof node2 ||
      ((typeof node1 === 'string' || typeof node1 === 'number') && node1 !== node2) ||
      node1.type !== node2.type;
    const attributesChanged =
      !!node1.attributes &&
      !!node2.attributes &&
      (Object.keys(node1.attributes).length !== Object.keys(node2.attributes).length ||
        Object.keys(node1.attributes).some(
          a =>
            node1.attributes[a] !== node2.attributes[a] &&
            (null == node1.attributes[a] ? '' : node1.attributes[a]).toString() !==
              (null == node2.attributes[a] ? '' : node2.attributes[a]).toString()
        ));
    return nodeChanged || attributesChanged;
  };

  const controller = ({ state, act }) => ({
    getCount1: () => state.count1,
    getCount2: () => state.count2,
    addCount1: count => act(state => ({ ...state, count1: state.count1 + count })),
    addCount2: count => act(state => ({ ...state, count2: state.count2 + count }),)
  });

  /**
   * 
   * @param {number} count 
   * @param {string} text 
   * @param {function(): void} onCountChange 
   */
  const view = (count, text, onCountChange) =>
    h('div', {},
      h('h2', {}, text),
      h('button', { click: e => onCountChange(-1) }, '-'),
      h('span', {}, count),
      h('button', { click: e => onCountChange(1) }, '+')
    );

  /**
   * 
   * @param {Object} obj 
   * @param {import('../models').State} obj.state 
   */
  const view$1 = (controller) => 
    h('div', {}, h('h3', {}, 'count1 * count2'), h('div', {}, controller.getCount1() + controller.getCount2()));

  /**
   * 
   * @param {Object} obj 
   * @param {import('../models').State} obj.state 
   */
  const view$2 = (controller) => 
    h('div', {}, h('h3', {}, 'count1 * count2'), h('div', {}, controller.getCount1() * controller.getCount2()));

  /**
   * A Module that abstracts DOM interactions.
   * It's purpose is to perform actions on the DOM like creating and mounting elements
   *
   * @module dom
   */

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

  /**
   * @typedef {{ count1: number, count2: number }} State
  */

  const initialState = {
    count1: 0,
    count2: 0
  };

  const mainView = (controller) => 
    h('main', {}, 
      h('div',{}, 
        view(controller.getCount1(), 'count1', c => controller.addCount1(c)),
        view(controller.getCount2(), 'count1', c => controller.addCount2(c)),
      ),
      h('div',{}, 
        view$1(controller),
        view$2(controller),
      )
    );

  mountWithActions(document.body, ({ state, act }) => mainView(controller({ state, act })), initialState);

}());
