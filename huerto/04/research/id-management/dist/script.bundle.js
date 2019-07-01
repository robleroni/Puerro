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
   * @typedef {{ id: number, name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
   */

  /**
   * Creates a vegetable
   */
  const Vegetable = () => {
    const _id = Observable(0);
    const _name = Observable('');
    const _classification = Observable('');
    const _origin = Observable('');
    const _plantend = Observable(false);
    const _amount = Observable(0);
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

      toString: () => `
        ${_name.get()} (${_classification.get()}) from ${_origin.get()},
        ${_plantend.get() ? `planted (${_amount.get()})` : 'not planted'},
        ${_comments.get()}
      `,
    };
  };

  /**
   * @typedef {{ id: number, name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
   */
  const vegetables = ObservableList([]);
  const selectedId = Observable(0); // Maybe use Nothing

  function* id() {
    let id = 0;
    while (true) {
      id++;
      yield id;
    }
  }
  const genId = id();

  /**
   * Renders a removable vegetable entry with the given vegetable in the given container
   *
   * @param {HTMLElement} $container
   * @param {Vegetable} vegetable
   */
  const createVegetableEntry = ($container, vegetable) => {
    const generateLi = _vegetable => {
      const $li = createDomElement('li', { 'data-id': _vegetable.getId() }, _vegetable.toString());

      $li.addEventListener('click', () => {
        selectedId.set(_vegetable.getId());
      });

      return $li;
    };

    let $li = generateLi(vegetable);
    $container.appendChild($li);

    vegetables.onRemove(_vegetable => {
      if (vegetable.getId() !== _vegetable.getId()) {
        return;
      }
      const index = [...$container.children].indexOf($li);
      $container.removeChild($li);
      if (vegetables.count() === 0) {
        return selectedId.set(0);
      }
      if (index === vegetables.count()) {
        return selectedId.set(vegetables.get(index - 1).getId());
      }
      selectedId.set(vegetables.get(index).getId());
    });
    vegetables.onReplace((newVegetable, oldVegetable) => {
      if (vegetable.getId() === oldVegetable.getId()) {
        const $newLi = generateLi(newVegetable);
        $container.replaceChild($newLi, $li);
        $li = $newLi;
        vegetable = newVegetable;
        selectedId.set(selectedId.get());
      }
    });
  };

  /**
   *
   * @param {HTMLSelectElement} $select
   */
  const renderVegetableClassifications = $select => {
    vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
  };

  /**
   *
   * @param {*} vegetable
   */
  const setFormValue = $form => vegetable => {
    $form.name.value = vegetable.getName();
    $form.classification.value = vegetable.getClassification();
    $form.origin.value = vegetable.getOrigin();
    $form.planted.checked = vegetable.getPlanted();
    $form.amount.value = vegetable.getAmount();
    $form.comments.value = vegetable.getComments();
  };

  /**
   *
   * @param {HTMLUListElement} $list
   * @returns {function(Event): void}
   */
  const onFormSubmit = event => {
    event.preventDefault(); // Prevent Form Submission
    const $form = event.target;
    $form.name.classList.remove('invalid');
    const vegetable = Vegetable();
    vegetable.setId(genId.next().value);
    vegetable.setName($form.name.value);
    vegetable.setClassification($form.classification.value);
    vegetable.setOrigin($form.origin.value);
    vegetable.setPlanted($form.planted.checked);
    vegetable.setAmount($form.amount.value);
    vegetable.setComments($form.comments.value);

    if (selectedId.get() > 0) {
      const oldVegetable = vegetables.getAll().filter(v => v.getId() === selectedId.get());
      vegetables.replace(vegetables.get(oldVegetable, vegetable));
      selectedId.set(0);
    } else {
      vegetables.add(vegetable);
    }
    selectedId.set(vegetable.getId());
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

  const onDeleteClick = evt => {
    const vegetable = vegetables.getAll().find(v => v.getId() === selectedId.get());
    vegetables.remove(vegetable);
  };

  /**
   *
   * @param {HTMLFormElement} $form
   * @param {HTMLUListElement} $vegetables
   * @param {HTMLButtonElement} $delete
   */
  const onIndexChange = ($form, $vegetables, $delete) => (newId, oldId) => {
    const selectedClass = 'selected';
    if (oldId > 0 && vegetables.getAll().some(v => v.getId() === oldId)) {
      $vegetables.querySelector(`li[data-id="${oldId}"]`).classList.remove(selectedClass);
    }
    if (newId > 0) {
      $vegetables.querySelector(`li[data-id="${newId}"]`).classList.add(selectedClass);
      setFormValue($form)(vegetables.getAll().find(v => v.getId() === newId));
      $delete.removeAttribute('disabled');
    }
    if (newId === 0) {
      $form.reset();
      $delete.setAttribute('disabled', true);
    }
  };

  /**
   * Constructor function to create the Huerto UI
   *
   * @param {HTMLFormElement} $form - Input element to add new vegetables
   * @param {HTMLElement} $vegetables - Container for the vegetables
   * @param {HTMLButtonElement} $delete - Delete button
   * @param {HTMLButtonElement} $add - Delete button
   */
  const initHuerto = ($form, $vegetables, $delete, $add) => {
    $form.addEventListener('submit', onFormSubmit);
    $form.planted.addEventListener('change', onPlantedChecked($form.amount));
    $form.classification.addEventListener('change', onClassification($form.asia)('Tubers'));
    $form.classification.addEventListener('change', onClassification($form.america)('Fungi'));
    $delete.addEventListener('click', onDeleteClick);
    $add.addEventListener('click', evt => {
      selectedId.set(0);
    });

    $form.name.oninvalid = event => event.target.classList.add('invalid');

    renderVegetableClassifications($form.classification);

    vegetables.onAdd(vegetable => createVegetableEntry($vegetables, vegetable));
    selectedId.onChange(onIndexChange($form, $vegetables, $delete));
  };

  initHuerto(
    document.querySelector('form'),
    document.getElementById('vegetables'),
    document.getElementById('delete'),
    document.getElementById('add'),
  );

}());
