(function () {
  'use strict';

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
