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

  describe('Observables', test => {
    test('Observable Value', assert => {
      // given
      const observable1 = Observable('');
      const observable2 = Observable('');

      let newValue1, oldValue1, newValue2, oldValue2;
      observable1.onChange((newVal, oldVal) => { newValue1 = newVal; oldValue1 = oldVal; });
      observable2.onChange((newVal, oldVal) => { newValue2 = newVal; oldValue2 = oldVal; });
      
      // initial state
      assert.is(observable1.get(), '');

      // when  
      observable1.set('Puerro');

      // then 
      assert.is(newValue1,         'Puerro'); // subscribers got notified  
      assert.is(oldValue1,         '');       // subscribers got notified  
      assert.is(observable1.get(), 'Puerro'); // value has updated

      // when the receiver symbol changes
      const newRef = observable1;
      newRef.set('Huerto');

      // then listener still updates correctly
      assert.is(newValue1,         'Huerto'); // subscribers got notified  
      assert.is(oldValue1,         'Puerro'); // subscribers got notified  
      assert.is(observable1.get(), 'Huerto'); // value has updated

      // when
      observable2.set('Puerro');

      // then subscribers get notified
      assert.is(newValue1,         'Huerto');
      assert.is(newValue2,         'Puerro');
      assert.is(oldValue1,         'Puerro');
      assert.is(oldValue2,         '');
      assert.is(observable2.get(), 'Puerro'); //  value is updated
    });

    test('Observable List', assert => {
      // given
      const raw = [];
      const list = ObservableList(raw); // decorator pattern

      let addCount = 0, removeCount = 0;
      list.onAdd   (item => (addCount    += item));
      list.onRemove(item => (removeCount += item));

      // initial
      assert.is(list.count(), 0);
      assert.is(raw.length,   0);

      // when
      list.add(1);

      // then
      const index = list.indexOf(1);
      assert.is(addCount,        1);
      assert.is(list.count(),    1);
      assert.is(raw.length,      1);
      assert.is(index,           0);
      assert.is(list.get(index), 1);

      // when
      list.remove(1);

      // then
      assert.is(removeCount,  1);
      assert.is(list.count(), 0);
      assert.is(raw.length,   0);
    });

    test('Observable Object', assert => {
      // given
      const object = ObservableObject({}); // decorator pattern

      let newObject, oldObject, newValue, oldValue;
      object.onChange (         (newObj, oldObj) => { newObject = newObj; oldObject = oldObj; });
      object.subscribe('value', (newVal, oldVal) => { newValue  = newVal; oldValue  = oldVal; });
      
      // initial
      assert.objectIs(object.get(), {});
      assert.objectIs(oldObject,    {});
      assert.objectIs(newObject,    {});
      assert.is      (oldValue,     undefined);
      assert.is      (newValue,     undefined);

      // when
      object.set({ value: 1 });

      // then
      assert.objectIs(oldObject,    {});
      assert.objectIs(newObject,    { value: 1 });
      assert.is      (oldValue,     undefined);
      assert.is      (newValue,     1);

      // when
      object.push('text', 'Puerro');

      // then
      assert.objectIs(oldObject,    { value: 1 });
      assert.objectIs(newObject,    { value: 1, text: 'Puerro' });
      assert.is      (oldValue,     undefined);
      assert.is      (newValue,     1);

      // when
      object.replace({ text: 'Huerto' });

      // then
      assert.objectIs(oldObject,    { value: 1,         text: 'Puerro' });
      assert.objectIs(newObject,    { value: undefined, text: 'Huerto' });
      assert.is      (oldValue,     1);
      assert.is      (newValue,     undefined);

      // when
      object.set({ value: 2 });

      // then
      assert.objectIs(oldObject,    { value: undefined, text: 'Huerto' });
      assert.objectIs(newObject,    { value: 2,         text: 'Huerto' });
      assert.is      (oldValue,     undefined);
      assert.is      (newValue,     2);

      // when
      object.set({ value: 1 });

      // then
      assert.objectIs(oldObject,    { value: 2, text: 'Huerto' });
      assert.objectIs(newObject,    { value: 1, text: 'Huerto' });
      assert.is      (oldValue,     2);
      assert.is      (newValue,     1);

      // when
      object.remove('value');

      // then
      assert.objectIs(object.get(), newObject);
      assert.objectIs(oldObject,    { value: 1,         text: 'Huerto' });
      assert.objectIs(newObject,    { value: undefined, text: 'Huerto' });
      assert.is      (oldValue,     1);
      assert.is      (newValue,     undefined);
    });
  });

}());
