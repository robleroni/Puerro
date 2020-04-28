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
