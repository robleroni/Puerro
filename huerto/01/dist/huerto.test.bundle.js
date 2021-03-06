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

  describe('Huerto - 01', test => {
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
