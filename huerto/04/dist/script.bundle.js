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

  const Vegetable = () => {
    const _id             = Observable(0);
    const _name           = Observable('');
    const _classification = Observable('');
    const _origin         = Observable('');
    const _plantend       = Observable(false);
    const _amount         = Observable(0);
    const _comments       = Observable('');

    return {
      getId:              ()              => _id.getValue(),
      getName:            ()              => _name.getValue(),
      getClassification:  ()              => _classification.getValue(),
      getOrigin:          ()              => _origin.getValue(),
      getPlanted:         ()              => _plantend.getValue(),
      getAmount:          ()              => _amount.getValue(),
      getComments:        ()              => _comments.getValue(),
      setId:              id              => _id.setValue(id),
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
      const $li = createElement('li', { 'data-id': _vegetable.getId() })(_vegetable.toString());

      $li.addEventListener('click', () => {
        selectedId.setValue(_vegetable.getId());
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
        return selectedId.setValue(0);
      }
      if (index === vegetables.count()) {
        return selectedId.setValue(vegetables.get(index - 1).getId());
      }
      selectedId.setValue(vegetables.get(index).getId());
    });
    vegetables.onReplace((oldVegetable, newVegetable) => {
      if (vegetable.getId() === oldVegetable.getId()) {
        const $newLi = generateLi(newVegetable);
        $container.replaceChild($newLi, $li);
        $li = $newLi;
        vegetable = newVegetable;
        selectedId.setValue(selectedId.getValue());
      }
    });
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

    if (selectedId.getValue() > 0) {
      const oldVegetable = vegetables.getAll().filter(v => v.getId() === selectedId.getValue());
      vegetables.replace(vegetables.get(oldVegetable, vegetable));
      selectedId.setValue(0);
    } else {
      vegetables.add(vegetable);
    }
    selectedId.setValue(vegetable.getId());
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
    const vegetable = vegetables.getAll().find(v => v.getId() === selectedId.getValue());
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
      selectedId.setValue(0);
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