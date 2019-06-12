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

  const vegetables = ObservableList([]);
  const selectedVegetable = Observable(null);

  const initHuerto = ($input, $output) => {
    const $form = $input.querySelector('form');
    const $delButton = $form.delete;
    const $table = $output.querySelector('table');
    const $addButton = $output.querySelector('#add');
    const $trs = $output.querySelectorAll('tr:not(:first-child)');

    renderVegetableClassifications($form.classification);

    $form.addEventListener('submit', onFormSubmit);
    $trs.forEach($tr => $tr.addEventListener('click', onVegetableRowClick));

    selectedVegetable.onChange(selectTr($table));
    selectedVegetable.onChange(fillForm($form));

    vegetables.onAdd(addVegetable($table));
    vegetables.onAdd(_ => enableForm($form));

    vegetables.onReplace(updateVegetable($table));

    vegetables.onRemove(deleteVegetable($table));
    vegetables.onRemove(_ => (vegetables.getAll().length ? enableForm($form) : disableForm($form)));

    $addButton.addEventListener('click', _ => vegetables.add(Vegetable()));
    $delButton.addEventListener('click', _ => vegetables.remove(selectedVegetable.get()));

    $form.planted.addEventListener('change', onPlantedChecked($form.amount));
    $form.classification.addEventListener('change', onClassification($form.asia)('Tubers'));
    $form.classification.addEventListener('change', onClassification($form.america)('Fungi'));
  };

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
   * Updates a vegetable in the given table
   *
   * @param {HTMLTableElement} $table
   */
  const updateVegetable = $table => vegetable => {
    const $trs = $table.querySelectorAll('tr:not(:first-child)');
    const $tr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
    $table.replaceChild(render(trEntry(vegetable)), $tr);
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
   * Handle form submit event
   *
   * @param {Event} event
   */
  const onFormSubmit = event => {
    event.preventDefault(); // Prevent Form Submission

    if (null == selectedVegetable.get()) return;

    const $form = event.target;
    const vegetable = Object.assign({}, selectedVegetable.get()); // copy

    vegetable.setName($form.name.value);
    vegetable.setClassification($form.classification.value);
    vegetable.setOrigin($form.origin.value);
    vegetable.setPlanted($form.planted.checked);
    vegetable.setAmount($form.amount.value);
    vegetable.setComments($form.comments.value);

    vegetables.replace(selectedVegetable.get(), vegetable);
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
   * Disables the given form
   *
   * @param {HTMLFormElement} $form
   */
  const disableForm = $form => {
    $form.style.opacity = 0.3;
    [...$form.elements].forEach($element => ($element.disabled = true));
    $form.reset();
  };

  /**
   * Enables the given form
   *
   * @param {HTMLFormElement} $form
   */
  const enableForm = $form => {
    $form.style.opacity = 1;
    [...$form.elements].forEach($element => ($element.disabled = false));
    $form.reset();
  };

  /**
   * Selects the TR with the given vegetable
   *
   * @param {HTMLTableElement} $table
   */
  const selectTr = $table => vegetable => {
    const $trs = $table.querySelectorAll('tr:not(:first-child)');
    [...$trs].forEach($tr => $tr.classList.remove('selected'));

    if (null == vegetable) return; // no selection if null

    const $selectedTr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
    $selectedTr.classList.add('selected');
  };

  /**
   * Fills the form with the given vegetable
   *
   * @param {HTMLFormElement} $form
   */
  const fillForm = $form => vegetable => {
    if (null == vegetable) return; // no filling if null

    $form.name.value = vegetable.getName();
    $form.classification.value = vegetable.getClassification();
    $form.origin.value = vegetable.getOrigin();
    $form.planted.checked = vegetable.getPlanted();
    $form.amount.value = vegetable.getAmount();
    $form.amount.style.display = $form.planted.checked ? 'inline' : 'none';
    $form.comments.value = vegetable.getComments();
  };

  /**
   * Renders the vegetable classifications
   * @param {HTMLElement} $select
   */
  const renderVegetableClassifications = $select => {
    vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
  };

  initHuerto(
    document.querySelector('#vegetable-input'), 
    document.querySelector('#vegetable-output')
  );

}());
