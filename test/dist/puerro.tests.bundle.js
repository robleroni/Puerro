(function () {
  'use strict';

  (function () {

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
      const $report = createElement('div', { style })(`
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
      const $reportGroup = createElement('div', { style })(`Test ${name}`);
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

    const Observable = value => {
      const listeners = [];
      return {
        onChange: callback => {
          listeners.push(callback);
          callback(value, value);
        },
        getValue: () => value,
        setValue: newValue => {
          if (value === newValue) return;
          const oldValue = value;
          value = newValue;
          listeners.forEach(notify => notify(newValue, oldValue));
        },
      };
    };

    const ObservableList = list => {
      const addListeners = [];
      const removeListeners = [];
      return {
        onAdd: listener => addListeners.push(listener),
        onRemove: listener => removeListeners.push(listener),
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
        count: () => list.length,
        countIf: pred => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
        indexOf: item => list.indexOf(item),
        get: index => list[index]
      };
    };

    describe('observable', test => {
      test('value', assert => {
        const obs = Observable('');

        //  initial state
        assert.is(obs.getValue(), '');

        //  subscribers get notified
        let found;
        obs.onChange(val => (found = val));
        obs.setValue('firstValue');
        assert.is(found, 'firstValue');

        //  value is updated
        assert.is(obs.getValue(), 'firstValue');

        //  it still works when the receiver symbols changes
        const newRef = obs;
        newRef.setValue('secondValue');
        // listener updates correctly
        assert.is(found, 'secondValue');

        //  Attributes are isolated, no "new" needed
        const secondAttribute = Observable('');

        //  initial state
        assert.is(secondAttribute.getValue(), '');

        //  subscribers get notified
        let secondFound;
        secondAttribute.onChange(val => (secondFound = val));
        secondAttribute.setValue('thirdValue');
        assert.is(found, 'secondValue');
        assert.is(secondFound, 'thirdValue');

        //  value is updated
        assert.is(secondAttribute.getValue(), 'thirdValue');

        // subsribers get notified with access on old value
        let newFound, oldFound;
        secondAttribute.onChange((newVal, oldVal) => {
          newFound = newVal;
          oldFound = oldVal;
        });
        secondAttribute.setValue('fourthValue');
        assert.is(newFound, 'fourthValue');
        assert.is(oldFound, 'thirdValue');

        //  value is updated
        assert.is(secondAttribute.getValue(), 'fourthValue');
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
      const $report = createElement('div', { style })(`
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
      const $reportGroup = createElement('div', { style })(`Test ${name}`);
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

    describe('dom util', test => {
      test('createElement with plain text', assert => {
        // given
        const tagName = 'div';
        const content = 'test123';

        // when
        const $el = createElement(tagName)(content);

        // then
        assert.is($el.innerText, content);
        assert.is($el.tagName.toLowerCase(), tagName);
      });

      test('createElement with child nodes', assert => {
        // given
        const tagName = 'ul';
        const content = `
      <li>test</li>
      <li>123</li>
    `;

        // when
        const $el = createElement(tagName)(content);

        //  then
        assert.is($el.childElementCount, 2);
      });

      test('createElement with attribute', assert => {
        // given
        const tagName = 'p';
        const content = 'test';
        const attributes = { style: 'color: green' };

        // when
        const $el = createElement(tagName, attributes)(content);

        // then
        assert.is($el.getAttribute('style'), 'color: green');
      });
    });

  }());

  (function () {

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
      const $report = createElement('div', { style })(`
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
      const $reportGroup = createElement('div', { style })(`Test ${name}`);
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

    describe('diff util', test => {
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

}());
