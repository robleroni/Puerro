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
     *
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
        const a = 1;
        const b = 2;

        // when
        const result = sum(a, b);

        // then
        assert.is(result, 3);
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
     * Registers the event for adding a vegetable
     *
     * @param {HTMLInputElement} $vegetableInput - Input element to add new vegetables
     * @param {HTMLElement} $vegetablesOutput    - Container for the vegetables
     */
    function registerAddingVegetableEvent($vegetableInput, $vegetablesOutput) {
      $vegetableInput.addEventListener('keydown', event => {
        if (event.keyCode === ENTER_KEYCODE) {
          const $vegetable = document.createElement('li');
          $vegetable.textContent = $vegetableInput.value;
          $vegetablesOutput.appendChild($vegetable);
          $vegetableInput.value = '';
        }
      });
    }

    describe('01 - Huerto', test => {
      test('add Vegetable', assert => {
        // given
        const $vegetableInput = document.createElement('input');
        const $vegetables     = document.createElement('ul');
        registerAddingVegetableEvent($vegetableInput, $vegetables);

        // when
        $vegetableInput.value = 'leek';
        $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

        // then
        assert.is($vegetables.children.length, 1);
        assert.is($vegetables.innerHTML, '<li>leek</li>');
        assert.is($vegetableInput.value, '');

        // when
        $vegetableInput.value = 'tomato';
        $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

        // then
        assert.is($vegetables.children.length, 2);
        assert.is($vegetables.innerHTML, '<li>leek</li><li>tomato</li>');
        assert.is($vegetableInput.value, '');
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

    /**
     * Renders the Vegetable Classifications
     *
     * @param {HTMLSelectElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(createDomElement('option', {}, c)));
    };

    /**
     * Creates the vegetable output string
     *
     * @param {HTMLFormElement} $form
     */
    const createVegetableOutputString = $form =>
      `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

    describe('02 - Huerto', test => {

      test('adding vegetable', assert => {
        // given
        const form = {
          name:           { value:   'leek' },
          classification: { value:   'fruit' },
          origin:         { value:   'Europe' },
          planted:        { checked: true },
          amount:         { value:   '4' },
          comments:       { value:   'needs water daily' },
        };

        const $list = document.createElement('ul');

        // when
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 1);
        assert.is(
          $list.children[0].textContent,
          'leek (fruit) from Europe, planted (4), needs water daily'
        );

        // when
        form.name.value = 'tomato';
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 2);
        assert.is(
          $list.children[1].textContent,
          'tomato (fruit) from Europe, planted (4), needs water daily'
        );
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount   = document.createElement('input');

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

      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 9);
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
     * Event handler for subbmiting the form.
     * It appends the Vegetable Output String to the given list.
     *
     * @param {HTMLUListElement} $list
     * @returns {function(Event): void}
     */
    const onFormSubmit = $list => event => {
      event.preventDefault(); // Prevent Form Submission
      $list.appendChild(createDomElement('li', {}, vegetableOutputString(event.target)));
      event.target.name.classList.remove('invalid');
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

    /**
     * Event Handler for the classification dependent validation
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

    /**
     * Renders the Vegetable Classifications
     *
     * @param {HTMLSelectElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(createDomElement('option', {}, c)));
    };


    /**
     * Creates the vegetable output string
     *
     * @param {HTMLFormElement} $form
     */
    const vegetableOutputString = $form =>
      `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

    describe('03 Huerto', test => {

      test('adding vegetable', assert => {
        // given
        const form = {
          name:           createDomElement('input', { value:   'leek' }), // creating DOM Element for validation purposes
          classification: { value:   'fruit' },
          origin:         { value:   'Europe' },
          planted:        { checked: true },
          amount:         { value:   '4' },
          comments:       { value:   'needs water daily' },
        };

        const $list = document.createElement('ul');

        // when
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 1);
        assert.is(
          $list.children[0].textContent,
          'leek (fruit) from Europe, planted (4), needs water daily'
        );

        // when
        form.name.value = 'tomato';
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 2);
        assert.is(
          $list.children[1].textContent,
          'tomato (fruit) from Europe, planted (4), needs water daily'
        );
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount   = document.createElement('input');

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

      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 9);
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
     *
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

    const id = idGenerator();
    function* idGenerator() {
      let id = 0;
      while (true) yield ++id;
    }

    const Vegetable = () => {
      const _id = Observable(id.next().value);
      const _name = Observable('Vegi');
      const _classification = Observable('');
      const _origin = Observable('Europe');
      const _plantend = Observable(true);
      const _amount = Observable(1);
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
      };
    };

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

    const vegetables = ObservableList([]);
    const selectedVegetable = Observable(null);

    /**
     * Adds a vegetable to given table
     *
     * @param {HTMLTableElement} $table
     */
    const addVegetable = $table => vegetable => {
      $table.appendChild(render(trEntry(vegetable)));
      selectedVegetable.set(vegetable);
    };

    /**
     * Deletes a vegetable in the given table
     *
     * @param {HTMLTableElement} $table
     */
    const deleteVegetable = $table => vegetable => {
      if (null == vegetable) return;

      const $trs = $table.querySelectorAll('tr:not(:first-child)');
      const $tr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());

      if ($tr.previousSibling) {
        selectedVegetable.set(
          vegetables.getAll().find(v => v.getId() == $tr.previousSibling.getAttribute('data-id'))
        );
      }

      if ($tr.nextSibling) {
        selectedVegetable.set(
          vegetables.getAll().find(v => v.getId() == $tr.nextSibling.getAttribute('data-id'))
        );
      }

      $table.removeChild($tr);
    };

    /**
     * Handles row click event
     *
     * @param {Event} event
     */
    const onVegetableRowClick = event => {
      const $table = event.target.parentElement;
      const vegetable = vegetables.getAll().find(v => v.getId() == $table.getAttribute('data-id'));
      selectedVegetable.set(vegetable);
    };

    /**
     * Handles planted click
     *
     * @param {HTMLElement} $amount
     */
    const onPlantedChecked = $amount => event => {
      $amount.style.display = event.target.checked ? 'inline' : 'none';
    };

    /**
     * Handles classification changes
     *
     * @param {HTMLElement} $origin
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

    /**
     * Creates a virtual TR with the vegetable data of the given vegetable
     *
     * @param {import('./vegetable').Vegetable} vegetable
     */
    const trEntry = vegetable => {
      return h('tr', { 'data-id': vegetable.getId(), click: onVegetableRowClick }, [
        h('td', {}, vegetable.getName()),
        h('td', {}, vegetable.getClassification()),
        h('td', {}, vegetable.getOrigin()),
        h('td', { style: `opacity: ${vegetable.getPlanted() ? 1 : 0.3}` }, vegetable.getAmount()),
        h('td', {}, vegetable.getComments()),
      ]);
    };

    /**
     * Renders the vegetable classifications
     * @param {HTMLElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
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
        /*const form = {
          name: createDomElement('input', { value: 'tomato' }),
          classification: { value: 'fruit' },
          origin: { value: 'Europe' },
          planted: { checked: true },
          amount: { value: '4' },
          comments: { value: 'needs water daily' },
        };*/

        // before
        assert.is(vegetables.count(), 0);

        // when
        vegetables.add(Vegetable());

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
        const $table = createDomElement('table');
        $table.appendChild(createDomElement('tr')); // adding header

        const vegetable = Vegetable();
        vegetable.setName('Tomato');

        // when
        addVegetable($table)(vegetable);

        // then
        const $tr = $table.querySelector('tr:not(:first-child)');
        assert.is($table.children.length, 2);
        assert.true($tr.textContent.includes('Tomato'));
      });

      test('delete Vegetable', assert => {
        // given
        const $table = createDomElement('table');
        $table.appendChild(createDomElement('tr')); // adding header

        const vegetable = Vegetable();
        vegetable.setName('Tomato');
        vegetables.add(vegetable);

        //when
        addVegetable($table)(vegetable);

        // then
        const $tr = $table.querySelector('tr:not(:first-child)');
        assert.is($table.children.length, 2);
        assert.true($tr.textContent.includes('Tomato'));

        // when
        deleteVegetable($table)(vegetable);

        // then
        assert.is($table.children.length, 1);
      });
    });

  }());

  // Generated file

  // Generated file

}());
