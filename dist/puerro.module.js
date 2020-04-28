/**
 * Observable Pattern Implementations
 *
 * @module observable
 */

/**
 * Creates an Observable
 * @param {any} item
 */
const Observable = item => {
  const listeners = [];
  return {
    get: () => item,
    set: newItem => {
      if (item === newItem) return;
      const oldItem = item;
      item = newItem;
      listeners.forEach(notify => notify(newItem, oldItem));
    },
    onChange: callback => {
      listeners.push(callback);
      callback(item, item);
    },
  };
};

/**
 * Creates an object on which each property is observable
 * @param {any} object
 */
const ObservableObject = object => {
  const listeners   = [];
  const subscribers = {};

  const notify = newObject => {
    if (object == newObject) return;
    const oldObject = object;
    object = newObject;

    Object.keys(newObject).forEach(key => {
      const newValue = newObject[key];
      const oldValue = oldObject[key];
      if (oldValue === newValue) return;
      (subscribers[key] || []).forEach(subscriber => subscriber(newValue, oldValue));
    });
    listeners.forEach(listener => listener(newObject, oldObject));
  };

  return {
    get:       ()              => object,
    set:       newObject       => notify({ ...object, ...newObject }),
    push:      (key, value)    => notify({ ...object, ...{ [key]: value } }),
    remove:    key             => notify({ ...object, ...{ [key]: undefined } }),
    replace:   newObject       => {
      const emptyObject = Object.assign({}, object);
      Object.keys(emptyObject).forEach(key => emptyObject[key] = undefined);
      notify({ ...emptyObject, ...newObject});
    },
    onChange:  callback        => { listeners.push(callback); callback(object, object); },
    subscribe: (key, callback) => {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
      callback(object[key], object[key]);
    },
    // unsubscribe, removeOnChange
  };
};

/**
 * Creates an Observable list
 * @param {any[]} list
 */
const ObservableList = list => {
  const addListeners     = [];
  const removeListeners  = [];
  const replaceListeners = [];
  return {
    onAdd:     listener => addListeners    .push(listener),
    onRemove:  listener => removeListeners .push(listener),
    onReplace: listener => replaceListeners.push(listener),
    add: item => {
      list.push(item);
      addListeners.forEach(listener => listener(item));
    },
    remove: item => {
      const i = list.indexOf(item);
      if (i >= 0) {
        list.splice(i, 1);
      } // essentially "remove(item)"
      removeListeners.forEach(listener => listener(item));
    },
    replace: (item, newItem) => {
      const i = list.indexOf(item);
      if (i >= 0) {
        list[i] = newItem;
      }
      replaceListeners.forEach(listener => listener(newItem, item));
    },
    count:   ()    => list.length,
    countIf: pred  => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
    indexOf: item  => list.indexOf(item),
    get:     index => list[index],
    getAll:  ()    => list,
  };
};

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
* Creates a new HTML Element.
* If the attribute is a function it will add it as an EventListener.
* Otherwise as an attribute.
*
* @param {string} tagName name of the tag
* @param {object} attributes attributes or listeners to set in element
* @param {*} innerHTML content of the tag
*
* @returns {HTMLElement}
*/
const createDomElement = (tagName, attributes = {}, innerHTML = '') => {
  const $element = document.createElement(tagName);
  $element.innerHTML = innerHTML;
  Object.keys(attributes)
    .filter(key => null != attributes[key]) // don't create attributes with value null/undefined
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
 * Converts a DOM Node to a Virtual Node
 *
 * @param {HTMLElement} $node
 *
 * @returns {VNode}
 */
const toVDOM = $node => {
  const tagName = $node.tagName;
  const $children = $node.children;

  const attributes = Object.values($node.attributes).reduce((attributes, attribute) => {
    attributes[attribute.name] = attribute.value;
    return attributes;
  }, {});

  if ($children.length > 0) {
    return vNode(tagName, attributes, Array.from($children).map(toVDOM));
  }

  return vNode(tagName, attributes, $node.textContent);
};

/**
 * Renders a given node object
 * Considers ELEMENT_NODE AND TEXT_NODE https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 *
 * @param {VNode} node
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
 * @param {function(): VNode} view
 * @param {object} state
 * @param {boolean} diffing
 */
const mount = ($root, view, state, diffing = true) => {
  const params = {
    get state() {
      return state;
    },
    setState,
  };

  let vDom = view(params);
  $root.prepend(render(vDom));

  function setState(newState) {
    if (typeof newState === 'function') {
      state = { ...state, ...newState(state) };
    } else {
      state = { ...state, ...newState };
    }
    refresh();
  }

  function refresh() {
    const newVDom = view(params);

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
 * @param {VNode} oldNode
 * @param {VNode} newNode
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
 * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
 */

/**
 * Global store object
 */
const store = ObservableObject({});

/**
 * Abstract controller to use a MVC approach using the virtual DOM as a renderer.
 */
class PuerroController {

  /**
   * Creating a new PuerroController
   * 
   * @param {HTMLElement} $root DOM element to mount view
   * @param {object} state initial state
   * @param {function(controller): VNode} view Virtual DOM creator
   * @param {boolean} diffing if diffing should be used
   */
  constructor($root, state, view, diffing = true) {
    this.$root = $root;
    this.state = ObservableObject({ ...state });
    this.view = view;
    this.diffing = diffing;
    this.vDom = null;
    this.init();
    this.onInit();
  }

  /**
   * Initial function of the Puerro Controller
   */
  init() {
    this.vDom = this.view(this);
    this.$root.prepend(render(this.vDom));
    this.store.onChange(s => this.refresh());
    this.state.onChange(s => this.refresh());
  }

  /**
   * On Init Hook 
   */
  onInit() {}

  /**
   * Refreshs the view
   */
  refresh() {
    const newVDom = this.view(this);
    this.repaint(newVDom);
    this.vDom = newVDom;
  }

  /**
   * Repaint the virtual DOM using the DOM API
   * 
   * @param {VNode} newVDom vDom to be paintend
   */
  repaint(newVDom) {
    if (this.diffing) {
      diff(this.$root, newVDom, this.vDom);
    } else {
      this.$root.replaceChild(render(newVDom), this.$root.firstChild);
    }
  }

  /**
   * Returns the model (store and state)
   */
  get model() {
    return { ...store.get(), ...this.state.get() };
  }

  /**
   * Returns the store
   */
  get store() { return store; }

  /**
   * Static method for returning the store
   */
  static get store() { return store; }
}

/**
 * Abstract class which provides state to custom HTML elements.
 */
class PuerroElement extends HTMLElement {
  /**
   * Creates a new Puerro Element
   * 
   * @param {Object} initialState initial state
   */
  constructor(initialState = {}) {
    super();
    this.state = initialState;
  }

  /**
   * Connected Callback
   */
  connectedCallback() {
    this.refresh();
  }

  /**
   * Sets a new state based on a given object or function
   *
   * @param {object | Function} newState
   */
  setState(newState) {
    if (typeof newState === 'function') {
      this.state = { ...this.state, ...newState(state) };
    } else {
      this.state = { ...this.state, ...newState };
    }
    this.refresh();
  }

  /**
   * Refreshes the Dom
   */
  refresh() {
    const newVNode = this.render();
    if (null == this.vNode) {
      this.prepend(render(this.render()));
    } else {
      diff(this, newVNode, this.vNode);
    }
    this.vNode = newVNode;
  }

  /**
   * Render function
   * @abstract
   */
  render() { }
}

/**
 * A Module to use for testing.
 *
 * @module test
 */

/**
 * Adds a testGroup to the test report
 *
 * @param {String} name
 * @param {Function} callback
 */
function describe(name, callback) {
  reportGroup(name);
  return callback(test);
}

/**
 * Adds and executes a test.
 *
 * @param {String} name
 * @param {Function} callback
 */
function test(name, callback) {
  const assert = Assert();
  callback(assert);
  report(name, assert.getOk());
}

/**
 * Creates a new Assert object
 */
function Assert() {
  const ok = [];

  const assert = (actual, expected, result)=> {
    if (!result) {
      console.log(`expected "${expected}" but was "${actual}"`);
      try {
        throw Error();
      } catch (err) {
        console.log(err);
      }
    }
    ok.push(result);
  };

  return {
    getOk: () => ok,
    is: (actual, expected) => assert(actual, expected, actual === expected),
    objectIs: (actual, expected) =>
      assert(actual, expected,
        Object.entries(actual).toString() === Object.entries(expected).toString()
      ),
    true: cond => ok.push(cond),
  };
}

/**
 * Creates group heading, to group tests together
 *
 * @param {string} name
 */
function reportGroup(name) {
  const style = `
    font-weight: bold;
    margin-top: 10px;
  `;
  const $reportGroup = createDomElement('div', { style }, `Test ${name}`);
  document.body.appendChild($reportGroup);
}


/**
 * Reports an executed test to the DOM
 *
 * @param {string} origin
 * @param {Array<bool>} ok
 */
function report(origin, ok) {
  const style = `
    color: ${ok.every(elem => elem) ? 'green' : 'red'};
    padding-left: 20px;
  `;
  const $report = createDomElement('div', { style },`
    ${ok.filter(elem => elem).length}/${ok.length} Tests in ${origin} ok.
  `);
  document.body.appendChild($report);
}

export { Observable, ObservableList, ObservableObject, createDomElement, h, toVDOM, render, mount, diff, PuerroController, PuerroElement, describe };
