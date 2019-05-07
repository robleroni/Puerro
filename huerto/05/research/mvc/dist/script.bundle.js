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
   * @param {VNode[] | VNode | any} nodes
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

  /**
   * Observable Pattern Implementation
   *
   * @module observable
   */

  const ObservableObject = object => {
    const listeners = [];
    const events = {};
    return {
      get: () => object,
      set: data => {
        object = {...object, ...data};
        Object.keys(data).forEach(key => {
          const handlers = events[key] || [];
          handlers.forEach(handler => handler(data[key]));
        });
        listeners.forEach(listener => listener(data));
      },
      onChange: callback => {
        listeners.push(callback);
        callback(object, object);
      },
      subscribe: (key, handler) => {
        events[key] = events[key] || [];
        events[key].push(handler);
      }
    };
  };

  const store = ObservableObject({});

  class Controller {
    constructor($root, state, view, diffing = true) {
      this.$root = $root;
      this.state = ObservableObject({...state});
      this.view = view;
      this.diffing = diffing;
      this.vDom = null;
      this.init();
    }

    get model() {
      return { ...store.get(), ...this.state.get() };
    }

    get store() {
      return store;
    }

    static get store() {
      return store;
    }

    init() {
      this.vDom = this.view(this);
      this.$root.prepend(render(this.vDom));
      this.store.onChange(s => this.refresh());
      this.state.onChange(s => this.refresh());
    }

    refresh() {
      const newVDom = this.view(this);
      this.repaint(newVDom);
      this.vDom = newVDom;
    }

    repaint(newVDom) {
      if (this.diffing) {
        diff(this.$root, newVDom, this.vDom);
      } else {
        this.$root.replaceChild(render(newVDom), this.$root.firstChild);
      }
    }
  }

  class ResearchController extends Controller {
    /**
     *
     * @param {number} count
     */
    addCount1(count) {
      this.refresh({ count1: this.model.count1 + count });
    }

    /**
     *
     * @param {number} count
     */
    addCount2(count) {
      this.refresh({ count2: this.model.count2 + count });
    }
  }

  /**
   * @typedef {{ count1: number, count2: number }} State
  */

  const initialState = {
    count1: 0,
    count2: 0
  };

  /**
   * 
   * @param {number} count 
   * @param {string} text 
   * @param {function(): void} onCountChange 
   */
  const view = (count, text, onCountChange) =>
    h('div', {},
      h('h2', {}, text),
      h('button', { click: _ => onCountChange(-1) }, '-'),
      h('span', {}, count),
      h('button', { click: _ => onCountChange(1) }, '+')
    );

  /**
   *
   * @param {Object} controller
   */
  const view$1 = (controller) =>
    h('div', {},
      h('h3', {}, 'count1 + count2'),
      h('div', {}, controller.model.count1 + controller.model.count2)
    );

  /**
   *
   * @param {Object} controller
   */
  const view$2 = (controller) =>
    h('div', {},
      h('h3', {}, 'count1 * count2'),
      h('div', {}, controller.model.count1 * controller.model.count2)
    );

  const view$3 = (controller) =>
    h('main', {},
      h('div',{},
        view(controller.model.count1, 'count1', c => controller.addCount1(c)),
        view(controller.model.count2, 'count2', c => controller.addCount2(c)),
      ),
      h('div',{},
        view$1(controller),
        view$2(controller),
      )
    );

  new ResearchController(document.body, initialState, view$3);

}());
