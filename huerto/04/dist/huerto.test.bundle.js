(function () {
  'use strict';

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

  const Vegetable = () => {
    const _name           = Observable('');
    const _classification = Observable('');
    const _origin         = Observable('');
    const _plantend       = Observable(false);
    const _amount         = Observable(0);
    const _comments       = Observable('');

    return {
      getName:            ()              => _name.getValue(),
      getClassification:  ()              => _classification.getValue(),
      getOrigin:          ()              => _origin.getValue(),
      getPlanted:         ()              => _plantend.getValue(),
      getAmount:          ()              => _amount.getValue(),
      getComments:        ()              => _comments.getValue(),
      setName:            name            => _name.setValue(name),
      setClassification:  classification  => _classification.setValue(classification),
      setOrigin:          origin          => _origin.setValue(origin),
      setPlanted:         plantend        => _plantend.setValue(plantend),
      setAmount:          amount          => _amount.setValue(amount),
      setComments:        comments        => _comments.setValue(comments),

      toString: () => `
        ${_name.getValue()} (${_classification.getValue()}) from ${_origin.getValue()}, 
        ${_plantend.getValue() ? `planted (${_amount.getValue()})` : 'not planted'}, 
        ${_comments.getValue()}
      `,
    };
  };

  /**
   * @typedef {{ name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
   */
  const vegetables = ObservableList([]);
  const selectedIndex = Observable(-1);

  /**
   * Renders a removable vegetable entry with the given vegetable in the given container
   *
   * @param {HTMLElement} $container
   * @param {Vegetable} vegetable
   */
  const createVegetableEntry = ($container, vegetable) => {
    const $template = document.querySelector('#vegetable-entry');
    const $entry = document.importNode($template.content, true);

    const $li = $entry.querySelector('li');
    const $span = $entry.querySelector('span');
    const $delButton = $entry.querySelector('button');

    $span.textContent = vegetable.toString();
    $delButton.onclick = _ => vegetables.remove(vegetable);

    $container.appendChild($li);

    $li.addEventListener('click', () => {
      selectedIndex.setValue(vegetables.indexOf(vegetable));
    });
    vegetables.onRemove(_vegetable =>
      vegetable === _vegetable ? $container.removeChild($li) : undefined
    );
  };

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
  const onFormSubmit = event => {
    event.preventDefault(); // Prevent Form Submission
    event.target.name.classList.remove('invalid');

    const $form = event.target;
    const vegetable = Vegetable();
    vegetable.setName($form.name.value);
    vegetable.setClassification($form.classification.value);
    vegetable.setOrigin($form.origin.value);
    vegetable.setPlanted($form.planted.checked);
    vegetable.setAmount($form.amount.value);
    vegetable.setComments($form.comments.value);

    vegetables.add(vegetable);
    selectedIndex.setValue(vegetables.indexOf(vegetable));
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

  describe('05 Huerto', test => {
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
      const $span = $ul.querySelector('span');
      assert.is($ul.children.length, 1);
      assert.true($span.textContent.includes('Tomato'));
    });

    test('remove Vegetable', assert => {
      // given
      const $ul = document.createElement('ul');
      const vegetable = Vegetable();
      vegetable.setName('Tomato');

      // when
      createVegetableEntry($ul, vegetable);

      // then
      const $span = $ul.querySelector('span');
      assert.is($ul.children.length, 1);
      assert.true($span.textContent.includes('Tomato'));

      // given
      const $delButton = $ul.querySelector('button');

      // when
      $delButton.dispatchEvent(new KeyboardEvent('click'));

      // then
      assert.is($ul.children.length, 0);
    });
  });

}());
