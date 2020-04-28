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
   * Create a new PuerroInput Component
   */
  class PuerroInputComponent extends PuerroElement {
    /**
     * Returns the selector of the element
     */
    static get Selector() { return 'puerro-input' };

    /**
     * Returns the label
     */
    get label() {
      return this.hasAttribute('label') && this.getAttribute('label');
    }

    /**
     * Sets the label
     * @param value label to be set
     */
    set label(value) {
      if (null == value) {
        this.removeAttribute('label');
      } else {
        this.setAttribute('label');
        this.refresh();
      }
    }

    /**
     * Dispatches the value changed event.
     * @param {Event} evt 
     */
    _onInput(evt) {
      this.dispatchEvent(new CustomEvent('valueChanged', { detail: evt.target.value }));
    }

    /**
     * Renders the view
     * 
     * @override
     */
    render() {
      return h('input', {
        type: 'number',
        name: 'name',
        placeholder: this.label,
        input: evt => this._onInput(evt)
      })
    }
  }

  /**
   * Creats a new Main Component
   */
  class MainComponent extends PuerroElement {
    /**
    * Returns the selector of the element
    */
    static get Selector() { return 'puerro-main' };

    /**
     * Sets the initail state
     */
    constructor() {
      super({ num1: 0, num2: 0 });
    }

    /**
     * Renders the view
     * 
     * @override
     */
    render() {
      return h('div', {},
        h(PuerroInputComponent.Selector, { label: 'num1', valueChanged: evt => this.setState({ num1: +evt.detail }) }),
        h('span', {}, '+'),
        h(PuerroInputComponent.Selector, { label: 'num2', valueChanged: evt => this.setState({ num2: +evt.detail }) }),
        h('span', {}, '= ' + (this.state.num1 + this.state.num2)),
      )
    }
  }

  describe('Examples - State Management with Web-Components', test => {
    window.customElements.define(PuerroInputComponent.Selector, PuerroInputComponent);
    window.customElements.define(MainComponent.Selector, MainComponent);

    test('PuerroInputComponent label', assert => {
      // given
      const $puerroComponent = createDomElement(PuerroInputComponent.Selector, { label: 'Test' });

      // when
      document.body.appendChild($puerroComponent);

      // then
      assert.is($puerroComponent.getAttribute('label'), 'Test');
      assert.is($puerroComponent.getElementsByTagName('input')[0].getAttribute('placeholder'), 'Test');

      // cleanup
      document.body.removeChild($puerroComponent);
    });

    test('PuerroInputComponent valueChanged', assert => {
      // given
      const onValueChanged = evt => assert.is(+evt.detail, 3);
      const $puerroComponent = createDomElement(PuerroInputComponent.Selector, { valueChanged: onValueChanged });
      const event = new Event('input');

      // when
      document.body.appendChild($puerroComponent);
      const $input = $puerroComponent.getElementsByTagName('input')[0];
      $input.value = 3;
      $input.dispatchEvent(event);

      // cleanup
      document.body.removeChild($puerroComponent);
    });
  });

}());
