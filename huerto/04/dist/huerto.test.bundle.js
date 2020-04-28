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
   * Renders a given node object
   * Considers ELEMENT_NODE AND TEXT_NODE https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
   *
   * @param {VNode} node
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

  describe('Huerto - 04', test => {
    test('renderVegetableClassifications', assert => {
      // given
      const $select = document.createElement('select');

      // when
      renderVegetableClassifications($select);

      // then
      assert.is($select.children.length, 10);
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
