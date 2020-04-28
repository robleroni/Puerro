(function () {
  'use strict';

  (function () {

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
     * Appends 'P' element to given output element.
     * 
     * @param {HTMLInputElement} $input element to get input from
     * @param {HTMLElement} $output element to append input to
     */
    const appendInput = ($input, $output) => _ => {
      const $element = createDomElement('p', {}, $input.value);
      $output.append($element);
      return $element; // return for testing purposes
    };

    /**
     * Changes the label of the given button
     * 
     * @param {HTMLButtonElement} $button to change label
     */
    const changeLabel = $button => event => {
      $button.textContent = 'Save: ' + event.target.value;
    };

    describe('Examples - DOM API', test => {
      test('appendInput', assert => {
        // given
        const $input = createDomElement('input', { value: 'Puerro' });
        const $output = createDomElement('div');

        // when
        const $element = appendInput($input, $output)(); // event object not needed

        // then
        assert.is($output.children.length, 1);
        assert.is($element.tagName, 'P');
        assert.is($element.textContent, 'Puerro');
      });

      test('changeLabel', assert => {
        // given
        const $input = createDomElement('input', { value: 'Puerro' });
        const $button = createDomElement('button', { type: 'button' });

        // when
        changeLabel($button)({ target: $input }); // mocking event object

        // then
        assert.is($button.textContent, 'Save: Puerro');
      });
    });

  }());

  (function () {

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
     * Creates a model
     * 
     * @param {object} state to be observable
     */
    const Model = ({ name = '', age = 0, errors = [] } = {}) => ({
      name: Observable(name),
      age: Observable(age),
      errors: ObservableList(errors)
    });

    /**
     * Creates a new controller
     * 
     * @param {object} model 
     */
    const Controller = model => {

      /**
       * Sets the name
       * 
       * @param {string} name 
       */
      const setName = name => {
        if (null == name || name.length === 0) {
          return alert('the name is required!');
        }
        model.name.set(name);
      };

      /**
       * Sets the age
       * 
       * @param {number} age 
       */
      const setAge = age => {
        model.age.set(age);
      };

      /**
       * Increases Age
       */
      const increaseAge = () => setAge(model.age.get() + 1);

      /**
       * Decreases Age
       */
      const decreaseAge = () => setAge(model.age.get() - 1);

      return {
        setName,
        increaseAge,
        decreaseAge,
      }
    };

    describe('Examples - MVC with Observables', test => {

      // before
      const model = Model();
      const controller = Controller(model);

      test('interact with controller', assert => {
        // inital
        assert.is(model.name.get(), '');
        assert.is(model.age.get(),   0);

        // when
        controller.setName('Puerro');
        controller.increaseAge();

        // then
        assert.is(model.name.get(), 'Puerro');
        assert.is(model.age.get(),   1);

        // when
        controller.setName('Huerto');
        controller.decreaseAge();

        // then
        assert.is(model.name.get(), 'Huerto');
        assert.is(model.age.get(),   0);
      });
    });

  }());

  (function () {

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
     * Observable Pattern Implementations
     *
     * @module observable
     */

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
     * Create a new CounterController
     */
    class CounterController extends PuerroController {

      /**
       * Increment the counter
       */
      increment() {
        this.state.set({counter: this.model.counter + 1});
      }

      /**
       * Decrement the counter
       */
      decrement() {
        this.state.set({counter: this.model.counter - 1});
      }
    }

    describe('Examples - MVC with virtual DOM', test => {

      // before
      const $root = createDomElement('div');
      const model = { counter: 0 };
      const view = x => h(); // not important for testing the logic
      const controller = new CounterController($root, model, view);

      test('using counter', assert => {
        // inital
        assert.is(controller.model.counter, 0);

        // when
        controller.increment();

        // then
        assert.is(controller.model.counter, 1);

        // when
        controller.decrement();

        // then
        assert.is(controller.model.counter, 0);
      });
    });

  }());

  (function () {

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
     * Creates the virtual DOM based on the given items
     * 
     * @param {Array} items to create the vdom with
     */
    const createVDOM = items => h('tbody', {}, 
      items.map(item =>  h('tr', { class: 'row' }, h('td', { class: 'item' }, item)))
    ); 

    /**
     * Handles the button click
     * 
     * @param {HTMLTableElement} $table 
     */
    const handleClick = $table => _ => {
      const items = ['Puerro', 'Huerto']; // items could be fetched from API's, DOM elements or others
      const vDOM = createVDOM(items);
      diff($table, vDOM, toVDOM($table.firstElementChild));
      return vDOM;
    };

    describe('Examples - virtual DOM', test => {
      test('createVDOM', assert => {
        // given
        const items = ['Puerro', 'Huerto'];

        // when
        const vDOM = createVDOM(items);

        // then
        assert.is(vDOM.children.length, 2);
        assert.is(render(vDOM).querySelector('td').textContent, 'Puerro'); // possibility to interact via DOM API
      });

      test('handleClick', assert => {
        // given
        const $table  = render(createVDOM(['Puerro']));

        // when
        handleClick($table)();

        // then
        assert.is($table.querySelector('td').textContent, 'Puerro');
      });
    });

  }());

  (function () {

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
     * Creates a view with the given state interface
     * 
     * @param {object} object used for state managemend 
     */
    const view = ({ state, setState }) =>
      h('div', { },
        h('input', {
          type:  'number',
          name:  'num1',
          input: evt => setState({ num1: +evt.target.value })
        }),
        h('span', {}, '+'),
        h('input', {
          type:  'number',
          name:  'num2',
          input: evt => setState({ num2: +evt.target.value })
        }),
        h('span', { }, '= ' + (state.num1+state.num2)),
      );

    describe('Examples - State Management with virtual DOM', test => {
      test('sum numbers', assert => {
        // given
        const setState = () => {};
        const state = {
          num1: 2,
          num2: 3
        };

        // when
        const vDOM = view({ state, setState });

        // then
        assert.is(vDOM.children[vDOM.children.length - 1].children[0], '= 5');
      });
    });

  }());

  (function () {

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

  // Generated file

}());
