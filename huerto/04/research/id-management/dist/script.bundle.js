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
   * Creates a node object which can be rendered
   *
   * @param {string} tagName
   * @param {object} attributes
   * @param {VNode[] | VNode | any} node
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

  /**
   * renders a given node object
   *
   * @param {import('./vdom').VNode} node
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
    const $element = createElement(node.tagName, node.attributes)('');
    node.children.forEach(c => $element.appendChild(render(c)));
    return $element;
  };

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
        replaceListeners.forEach(listener => listener(item, newItem));
      },
      count: () => list.length,
      countIf: pred => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
      indexOf: item => list.indexOf(item),
      get: index => list[index],
      getAll: () => list,
    };
  };

  const id = idGenerator();
  function* idGenerator() {
    let id = 0;
    while (true) yield ++id;
  }

  const Vegetable = () => {
    const _id = Observable(id.next().value);
    const _name = Observable('');
    const _classification = Observable('');
    const _origin = Observable('');
    const _plantend = Observable(false);
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
  const selectedId = Observable(0);

  const initHuerto = ($input, $output) => {
    const $form = $input.querySelector('form');
    const $delButton = $form.delete;
    const $table = $output.querySelector('table');
    const $addButton = $output.querySelector('#add');
    const $trs = $output.querySelectorAll('tr:not(:first-child)');

    vegetableClassifications
      .map(classification => createElement('option', { value: classification })(classification))
      .forEach($form.classification.appendChild.bind($form.classification));

    $trs.forEach($tr => $tr.addEventListener('click', onVegetableClick));

    $form.addEventListener('submit', onFormSubmit);

    selectedId.onChange(onSelectedVegetableChange($table));
    vegetables.onAdd(onVegetableAdd($table));
    vegetables.onReplace(onVegetableUpdate($table));
    vegetables.onRemove(onVegetableDelete($table));

    $addButton.addEventListener('click', _ => vegetables.add(Vegetable()));
    $delButton.addEventListener('click', onDeleteClick);
  };

  const $trEntry = vegetable => {
    const tr = h('tr', { 'data-id': vegetable.getId(), class: 'selected', click: onVegetableClick }, [
      h('td', {}, vegetable.getName()),
      h('td', {}, vegetable.getClassification()),
      h('td', {}, vegetable.getOrigin()),
      h('td', {}, vegetable.getAmount()),
      h('td', {}, vegetable.getComments()),
    ]);

    return render(tr);
  };

  const onVegetableAdd = $table => vegetable => {
    $table.appendChild($trEntry(vegetable));
    selectedId.set(vegetable.getId());
  };

  const onVegetableUpdate = $table => vegetable => {
    const $trs = $table.querySelectorAll('tr:not(:first-child)');

    if (vegetable.getId() < 1) return;

    const $oldTr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
    $table.replaceChild($trEntry(vegetable), $oldTr);
    selectedId.set(vegetable.getId());
  };

  const onVegetableDelete = $table => vegetable => {
    const $trs = $table.querySelectorAll('tr:not(:first-child)');

    if (vegetable.getId() < 1) return;

    const $oldTr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
    $table.removeChild($oldTr);
  };

  const onVegetableClick = event => {
    selectedId.set(event.target.parentElement.getAttribute('data-id'));
  };

  const onDeleteClick = evt => {
    if (vegetables.getAll().length < 1) return;
    const vegetable = vegetables.getAll().find(v => v.getId() == selectedId.get());

    console.log(vegetables.indexOf(vegetable));

    if (
      vegetables.indexOf(vegetable) === 0 &&
      vegetables.indexOf(vegetable) === vegetables.getAll().length - 1
    ) {
      selectedId.set(0);
      vegetables.remove(vegetable);
      return;
    }

    if (vegetables.indexOf(vegetable) === vegetables.getAll().length - 1) {
      selectedId.set(vegetables.get(vegetables.indexOf(vegetable) - 1).getId());
      vegetables.remove(vegetable);
      return;
    }

    selectedId.set(vegetables.get(vegetables.indexOf(vegetable) + 1).getId());
    vegetables.remove(vegetable);
  };

  const onSelectedVegetableChange = $table => vegetableId => {
    const $trs = $table.querySelectorAll('tr:not(:first-child)');

    [...$trs].forEach($tr => $tr.classList.remove('selected'));

    if (vegetableId < 1) return;

    [...$trs]
      .filter($tr => $tr.getAttribute('data-id') == vegetableId)
      .forEach($tr => $tr.classList.add('selected'));

    const $form = document.querySelector('form');
    const vegetable = vegetables.getAll().find(v => v.getId() == vegetableId);

    $form.name.value = vegetable.getName();
    $form.classification.value = vegetable.getClassification();
    $form.origin.value = vegetable.getOrigin();
    $form.planted.checked = vegetable.getPlanted();
    $form.amount.value = vegetable.getAmount();
    $form.comments.value = vegetable.getComments();
  };

  const onFormSubmit = event => {
    event.preventDefault(); // Prevent Form Submission

    const $form = event.target;
    const vegetable = vegetables.getAll().find(v => v.getId() == selectedId.get());
    const newVegetable = Object.assign({}, vegetable);

    newVegetable.setName($form.name.value);
    newVegetable.setClassification($form.classification.value);
    newVegetable.setOrigin($form.origin.value);
    newVegetable.setPlanted($form.planted.checked);
    newVegetable.setAmount($form.amount.value);
    newVegetable.setComments($form.comments.value);

    vegetables.replace(vegetable, newVegetable);
  };

  initHuerto(document.querySelector('#vegetable-input'), document.querySelector('#vegetable-output'));

}());
