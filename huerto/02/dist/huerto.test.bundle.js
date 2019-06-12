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

  const vegetableClassifications = [
    '',
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

  describe('Huerto - 02', test => {

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
      assert.is($select.children.length, 10);
    });
  });

}());
