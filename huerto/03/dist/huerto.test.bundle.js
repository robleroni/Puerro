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
    vegetableClassifications
      .map(classification => createElement('option', { value: classification })(classification))
      .forEach($select.appendChild.bind($select));
  };

  /**
   *
   * @param {HTMLUListElement} $list
   * @returns {function(Event): void}
   */
  const onFormSubmit = $list => event => {
    event.preventDefault(); // Prevent Form Submission
    $list.appendChild(createElement('li')(_vegetableOutputString(event.target)));

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
        name: createElement('input', { value: 'tomato' })(),
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
