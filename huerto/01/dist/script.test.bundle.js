(function () {
  'use strict';

  /**
   * A Module that abstracts Virtual DOM interactions.
   * It's purpose is to perform actions on DOM-like Objects
   *
   * @module vdom
   */

  /**
   * A Module that abstracts DOM interactions.
   * It's purpose is to perform actions on the DOM like creating and mounting elements
   *
   * @module dom
   */

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
