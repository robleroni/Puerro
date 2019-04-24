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

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
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
     * Observable Pattern Implementation
     *
     * @module observable
     */

    const Observable = item => {
      const listeners = [];
      return {
        onChange: callback => {
          listeners.push(callback);
          callback(item, item);
        },
        get: () => item,
        set: newItem => {
          if (item === newItem) return;
          const oldItem = item;
          item = newItem;
          listeners.forEach(notify => notify(newItem, oldItem));
        },
      };
    };

    /**
     *
     * @param {any[]} list
     */
    const ObservableList = list => {
      const addListeners = [];
      const removeListeners = [];
      const replaceListeners = [];
      return {
        onAdd: listener => addListeners.push(listener),
        onRemove: listener => removeListeners.push(listener),
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
        count: () => list.length,
        countIf: pred => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
        indexOf: item => list.indexOf(item),
        get: index => list[index],
        getAll: () => list,
      };
    };

    describe('observable', test => {
      test('value', assert => {
        const obs = Observable('');

        //  initial state
        assert.is(obs.get(), '');

        //  subscribers get notified
        let found;
        obs.onChange(val => (found = val));
        obs.set('firstValue');
        assert.is(found, 'firstValue');

        //  value is updated
        assert.is(obs.get(), 'firstValue');

        //  it still works when the receiver symbols changes
        const newRef = obs;
        newRef.set('secondValue');
        // listener updates correctly
        assert.is(found, 'secondValue');

        //  Attributes are isolated, no "new" needed
        const secondAttribute = Observable('');

        //  initial state
        assert.is(secondAttribute.get(), '');

        //  subscribers get notified
        let secondFound;
        secondAttribute.onChange(val => (secondFound = val));
        secondAttribute.set('thirdValue');
        assert.is(found, 'secondValue');
        assert.is(secondFound, 'thirdValue');

        //  value is updated
        assert.is(secondAttribute.get(), 'thirdValue');

        // subsribers get notified with access on old value
        let newFound, oldFound;
        secondAttribute.onChange((newVal, oldVal) => {
          newFound = newVal;
          oldFound = oldVal;
        });
        secondAttribute.set('fourthValue');
        assert.is(newFound, 'fourthValue');
        assert.is(oldFound, 'thirdValue');

        //  value is updated
        assert.is(secondAttribute.get(), 'fourthValue');
      });

      test('list', assert => {
        const raw = [];
        const list = ObservableList(raw); // decorator pattern

        assert.is(list.count(), 0);
        let addCount = 0;
        let removeCount = 0;
        list.onAdd(item => (addCount += item));
        list.add(1);
        assert.is(addCount, 1);
        assert.is(list.count(), 1);
        assert.is(raw.length, 1);

        const index = list.indexOf(1);
        assert.is(index, 0);
        assert.is(list.get(index), 1);

        list.onRemove(item => (removeCount += item));
        list.remove(1);
        assert.is(removeCount, 1);
        assert.is(list.count(), 0);
        assert.is(raw.length, 0);
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

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
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
     * Adds a testGroup to the test report
     *
     * @param {String} name
     * @param {Function} callback
     */
    function describe(name, callback) {
      reportGroup(name);
      return callback(test);
    }

    describe('vdom', test => {

      test('createDomElement with plain text', assert => {
        // given
        const tagName = 'div';
        const content = 'test123';

        // when
        const $el = createDomElement(tagName, {}, content);

        // then
        assert.is($el.innerText, content);
        assert.is($el.tagName.toLowerCase(), tagName);
      });

      test('createDomElement with child nodes', assert => {
        // given
        const tagName = 'ul';
        const content = `
      <li>test</li>
      <li>123</li>
    `;

        // when
        const $el = createDomElement(tagName, {}, content);

        //  then
        assert.is($el.childElementCount, 2);
      });

      test('createDomElement with attribute', assert => {
        // given
        const tagName = 'p';
        const content = 'test';
        const attributes = { style: 'color: green' };

        // when
        const $el = createDomElement(tagName, attributes, content);

        // then
        assert.is($el.getAttribute('style'), 'color: green');
      });

      test('nodeChanged', assert => {
        // given
        let node1 = 1,
          node2 = 1;

        // when
        let result = changed(node1, node2);

        // then
        assert.is(result, false);

        // when
        node2 = 2;
        result = changed(node1, node2);

        // then
        assert.is(result, true);

        // when
        node2 = { tagName: 'p' };
        result = changed(node1, node2);

        // then
        assert.is(result, true);

        // when
        node1 = { tagName: 'p' };
        result = changed(node1, node2);

        // then
        assert.is(result, false);
      });

      test('attributesChanged', assert => {
        // given
        let node1 = { attributes: { test: 1 } };
        let node2 = { attributes: { test: 1 } };

        // when
        let result = changed(node1, node2);

        // then
        assert.is(result, false);

        // when
        node2.attributes.test = 2;
        result = changed(node1, node2);

        // then
        assert.is(result, true);

        // when
        delete node2.attributes.test;
        result = changed(node1, node2);

        // then
        assert.is(result, true);
      });
    });

  }());

  // Generated file

  (function () {

    /**
     * A Module that abstracts Virtual DOM interactions.
     * It's purpose is to perform actions on DOM-like Objects
     *
     * @module vdom
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

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
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
     * Adds a testGroup to the test report
     *
     * @param {String} name
     * @param {Function} callback
     */
    function describe(name, callback) {
      reportGroup(name);
      return callback(test);
    }

    const sum = (a, b) => a + b;

    describe('01 - Research - Testability', test => {
      test('adding numbers', assert => {
        // given
        const a = 2;
        const b = 2;

        // when
        const result = sum(a, b);

        // then
        assert.is(result, 4);
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

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
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
     * Adds a testGroup to the test report
     *
     * @param {String} name
     * @param {Function} callback
     */
    function describe(name, callback) {
      reportGroup(name);
      return callback(test);
    }

    const ENTER_KEYCODE = 13;

    /**
     * Constructor function to create the Huerto UI
     *
     * @param {HTMLInputElement} $vegetable - Input element to add new vegetables
     * @param {HTMLElement} $vegetables - Container for the vegetables
     */
    function Huerto($vegetable, $vegetables) {
      const vegetables = [];

      function bindEvents() {
        $vegetable.addEventListener('keydown', e => {
          if (e.keyCode === ENTER_KEYCODE) {
            vegetables.push($vegetable.value);
            $vegetable.value = '';
            renderVegetables();
          }
        });
      }

      function renderVegetables() {
        return ($vegetables.innerHTML = vegetables.map(v => `<li>${v}</li>`).join(''));
      }

      bindEvents();
    }

    describe('01 - Huerto', test => {
      test('renderVegetables', assert => {
        // given
        const $vegetable = document.createElement('input'),
          $vegetables = document.createElement('ul');
        Huerto($vegetable, $vegetables);

        // when
        $vegetable.value = 'tomato';
        $vegetable.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

        // then
        assert.is($vegetables.innerHTML, '<li>tomato</li>');
        assert.is($vegetable.value, '');
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

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
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
     * Adds a testGroup to the test report
     *
     * @param {String} name
     * @param {Function} callback
     */
    function describe(name, callback) {
      reportGroup(name);
      return callback(test);
    }

    const vegetableClassifications = [
      'Bulbs',
      'Flowers',
      'Fruits',
      'Fungi',
      'Leaves',
      'Roots',
      'Seeds',
      'Stems',
      'Tubers',
    ];

    /**
     * Creates the vegetable output string
     *
     * @param {HTMLFormElement} $form
     */
    const createVegetableOutputString = $form =>
      `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

    /**
     * Renders the Vegetable Classifications
     *
     * @param {HTMLSelectElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
    };

    /**
     * Event handler for subbmiting the form.
     * It appends the Vegetable Output String to the given list.
     *
     * @param {HTMLUListElement} $list
     * @returns {function(Event): void}
     */
    const onFormSubmit = $list => event => {
      event.preventDefault(); // Prevent Form Submission
      $list.appendChild(createDomElement('li', {}, createVegetableOutputString(event.target)));
    };

    /**
     * Event Handler for the amount input.
     * It changes the display style based on the planted checkbox
     *
     * @param {HTMLInputElement} $amount
     * @returns {function(Event): void}
     */
    const onPlantedChecked = $amount => event => {
      $amount.style.display = event.target.checked ? 'inline' : 'none';
    };

    describe('02 - Huerto', test => {
      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 9);
      });

      test('onFormSubmit', assert => {
        // given
        const form = {
          name: { value: 'tomato' },
          classification: { value: 'fruit' },
          origin: { value: 'Europe' },
          planted: { checked: true },
          amount: { value: '4' },
          comments: { value: 'needs water daily' },
        };

        const $list = document.createElement('ul');

        // when
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 1);
        assert.is(
          $list.children[0].textContent,
          'tomato (fruit) from Europe, planted (4), needs water daily'
        );
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount = document.createElement('input');

        // when
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'none');

        // when
        $checkbox.checked = true;
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'inline');
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

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
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
     * Adds a testGroup to the test report
     *
     * @param {String} name
     * @param {Function} callback
     */
    function describe(name, callback) {
      reportGroup(name);
      return callback(test);
    }

    const vegetableClassifications = [
      'Bulbs',
      'Flowers',
      'Fruits',
      'Fungi',
      'Leaves',
      'Roots',
      'Seeds',
      'Stems',
      'Tubers',
    ];

    /**
     *
     * @param {HTMLFormElement} $form
     */
    const _vegetableOutputString = $form =>
      `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

    /**
     *
     * @param {HTMLSelectElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
    };

    /**
     *
     * @param {HTMLUListElement} $list
     * @returns {function(Event): void}
     */
    const onFormSubmit = $list => event => {
      event.preventDefault(); // Prevent Form Submission
      $list.appendChild(createDomElement('li', {}, _vegetableOutputString(event.target)));
      event.target.name.classList.remove('invalid');
    };

    /**
     *
     * @param {HTMLInputElement} $amount
     * @returns {function(Event): void}
     */
    const onPlantedChecked = $amount => event => {
      $amount.style.display = event.target.checked ? 'inline' : 'none';
    };

    /**
     *
     * @param {HTMLInputElement} $origin
     */
    const onClassification = $origin => value => event => {
      $origin.disabled = false;
      $origin.labels.forEach(label => (label.style.opacity = '1'));

      if (event.target.value === value) {
        $origin.disabled = true;
        $origin.checked = false;
        $origin.labels.forEach(label => (label.style.opacity = '0.5'));
      }
    };

    describe('03 Huerto', test => {
      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 9);
      });

      test('onFormSubmit', assert => {
        // given
        const form = {
          name: createDomElement('input', { value: 'tomato' }),
          classification: { value: 'fruit' },
          origin: { value: 'Europe' },
          planted: { checked: true },
          amount: { value: '4' },
          comments: { value: 'needs water daily' },
        };

        const $list = document.createElement('ul');

        // when
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 1);
        assert.is(
          $list.children[0].textContent,
          'tomato (fruit) from Europe, planted (4), needs water daily'
        );
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount = document.createElement('input');

        // when
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'none');

        // when
        $checkbox.checked = true;
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'inline');
      });

      test('onClassification', assert => {
        // given
        const classification = {};
        const $origin = document.createElement('input');

        // when
        classification.value = 'Fungi';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, true);
        assert.is($origin.checked, false);

        // when
        classification.value = 'Fruits';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, false);
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

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
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
     * Adds a testGroup to the test report
     *
     * @param {String} name
     * @param {Function} callback
     */
    function describe(name, callback) {
      reportGroup(name);
      return callback(test);
    }

    const vegetableClassifications = [
      'Bulbs',
      'Flowers',
      'Fruits',
      'Fungi',
      'Leaves',
      'Roots',
      'Seeds',
      'Stems',
      'Tubers',
    ];

    /**
     * Observable Pattern Implementation
     *
     * @module observable
     */

    const Observable = item => {
      const listeners = [];
      return {
        onChange: callback => {
          listeners.push(callback);
          callback(item, item);
        },
        get: () => item,
        set: newItem => {
          if (item === newItem) return;
          const oldItem = item;
          item = newItem;
          listeners.forEach(notify => notify(newItem, oldItem));
        },
      };
    };

    /**
     *
     * @param {any[]} list
     */
    const ObservableList = list => {
      const addListeners = [];
      const removeListeners = [];
      const replaceListeners = [];
      return {
        onAdd: listener => addListeners.push(listener),
        onRemove: listener => removeListeners.push(listener),
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
        count: () => list.length,
        countIf: pred => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
        indexOf: item => list.indexOf(item),
        get: index => list[index],
        getAll: () => list,
      };
    };

    const Vegetable = () => {
      const _id = Observable(0);
      const _name = Observable('');
      const _classification = Observable('');
      const _origin = Observable('');
      const _plantend = Observable(false);
      const _amount = Observable(0);
      const _comments = Observable('');

      return {
        getId: () => _id.get(),
        getName: () => _name.get(),
        getClassification: () => _classification.get(),
        getOrigin: () => _origin.get(),
        getPlanted: () => _plantend.get(),
        getAmount: () => _amount.get(),
        getComments: () => _comments.get(),
        setId: id => _id.set(id),
        setName: name => _name.set(name),
        setClassification: classification => _classification.set(classification),
        setOrigin: origin => _origin.set(origin),
        setPlanted: plantend => _plantend.set(plantend),
        setAmount: amount => _amount.set(amount),
        setComments: comments => _comments.set(comments),

        toString: () => `
        ${_name.get()} (${_classification.get()}) from ${_origin.get()},
        ${_plantend.get() ? `planted (${_amount.get()})` : 'not planted'},
        ${_comments.get()}
      `,
      };
    };

    /**
     * @typedef {{ id: number, name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
     */
    const vegetables = ObservableList([]);
    const selectedId = Observable(0); // Maybe use Nothing

    function* id() {
      let id = 0;
      while (true) {
        id++;
        yield id;
      }
    }
    const genId = id();

    /**
     * Renders a removable vegetable entry with the given vegetable in the given container
     *
     * @param {HTMLElement} $container
     * @param {Vegetable} vegetable
     */
    const createVegetableEntry = ($container, vegetable) => {
      const generateLi = _vegetable => {
        const $li = createDomElement('li', { 'data-id': _vegetable.getId() }, _vegetable.toString());

        $li.addEventListener('click', () => {
          selectedId.set(_vegetable.getId());
        });

        return $li;
      };

      let $li = generateLi(vegetable);
      $container.appendChild($li);

      vegetables.onRemove(_vegetable => {
        if (vegetable.getId() !== _vegetable.getId()) {
          return;
        }
        const index = [...$container.children].indexOf($li);
        $container.removeChild($li);
        if (vegetables.count() === 0) {
          return selectedId.set(0);
        }
        if (index === vegetables.count()) {
          return selectedId.set(vegetables.get(index - 1).getId());
        }
        selectedId.set(vegetables.get(index).getId());
      });
      vegetables.onReplace((newVegetable, oldVegetable) => {
        if (vegetable.getId() === oldVegetable.getId()) {
          const $newLi = generateLi(newVegetable);
          $container.replaceChild($newLi, $li);
          $li = $newLi;
          vegetable = newVegetable;
          selectedId.set(selectedId.get());
        }
      });
    };

    /**
     *
     * @param {HTMLSelectElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
    };

    /**
     *
     * @param {HTMLUListElement} $list
     * @returns {function(Event): void}
     */
    const onFormSubmit = event => {
      event.preventDefault(); // Prevent Form Submission
      const $form = event.target;
      $form.name.classList.remove('invalid');
      const vegetable = Vegetable();
      vegetable.setId(genId.next().value);
      vegetable.setName($form.name.value);
      vegetable.setClassification($form.classification.value);
      vegetable.setOrigin($form.origin.value);
      vegetable.setPlanted($form.planted.checked);
      vegetable.setAmount($form.amount.value);
      vegetable.setComments($form.comments.value);

      if (selectedId.get() > 0) {
        const oldVegetable = vegetables.getAll().filter(v => v.getId() === selectedId.get());
        vegetables.replace(vegetables.get(oldVegetable, vegetable));
        selectedId.set(0);
      } else {
        vegetables.add(vegetable);
      }
      selectedId.set(vegetable.getId());
    };

    /**
     *
     * @param {HTMLInputElement} $amount
     * @returns {function(Event): void}
     */
    const onPlantedChecked = $amount => event => {
      $amount.style.display = event.target.checked ? 'inline' : 'none';
    };

    /**
     *
     * @param {HTMLInputElement} $origin
     */
    const onClassification = $origin => value => event => {
      $origin.disabled = false;
      $origin.labels.forEach(label => (label.style.opacity = '1'));

      if (event.target.value === value) {
        $origin.disabled = true;
        $origin.checked = false;
        $origin.labels.forEach(label => (label.style.opacity = '0.5'));
      }
    };

    const onDeleteClick = evt => {
      const vegetable = vegetables.getAll().find(v => v.getId() === selectedId.get());
      vegetables.remove(vegetable);
    };

    describe('04 Huerto', test => {
      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 9);
      });

      test('onFormSubmit', assert => {
        // given
        const form = {
          name: createDomElement('input', { value: 'tomato' }),
          classification: { value: 'fruit' },
          origin: { value: 'Europe' },
          planted: { checked: true },
          amount: { value: '4' },
          comments: { value: 'needs water daily' },
        };

        // before
        assert.is(vegetables.count(), 0);

        // when
        onFormSubmit({ preventDefault: () => undefined, target: form });

        // then
        assert.is(vegetables.count(), 1);
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount = document.createElement('input');

        // when
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'none');

        // when
        $checkbox.checked = true;
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'inline');
      });

      test('onClassification', assert => {
        // given
        const classification = {};
        const $origin = document.createElement('input');

        // when
        classification.value = 'Fungi';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, true);
        assert.is($origin.checked, false);

        // when
        classification.value = 'Fruits';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, false);
      });

      test('add Vegetable', assert => {
        // given
        const $ul = document.createElement('ul');
        const vegetable = Vegetable();
        vegetable.setName('Tomato');

        // when
        createVegetableEntry($ul, vegetable);

        // then
        const $li = $ul.querySelector('li');
        assert.is($ul.children.length, 1);
        assert.true($li.textContent.includes('Tomato'));
      });

      test('remove Vegetable', assert => {
        // given
        const $ul = document.createElement('ul');
        const vegetable = Vegetable();
        vegetable.setName('Tomato');
        vegetables.add(vegetable);

        // when
        createVegetableEntry($ul, vegetable);

        // then
        const $li = $ul.querySelector('li');
        assert.is($ul.children.length, 1);
        assert.true($li.textContent.includes('Tomato'));

        // when
        $li.click();
        onDeleteClick();

        // then
        assert.is($ul.children.length, 0);
      });
    });

  }());

  // Generated file

  // Generated file

}());
