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
  const selectedIndex = Observable(-1); // Maybe use Nothing

  /**
   * Renders a removable vegetable entry with the given vegetable in the given container
   *
   * @param {HTMLElement} $container
   * @param {Vegetable} vegetable
   */
  const createVegetableEntry = ($container, vegetable) => {
    const generateLi = _vegetable => {
      const $li = createElement('li', {})(_vegetable.toString());

      $li.addEventListener('click', () => {
        selectedIndex.setValue(vegetables.indexOf(_vegetable));
      });
    
      return $li;
    };

    let $li = generateLi(vegetable);
    $container.appendChild($li);

    vegetables.onRemove(_vegetable =>
      vegetable === _vegetable ? $container.removeChild($li) : undefined
    );
    vegetables.onReplace((oldVegetable, newVegetable) =>{
      if (vegetable === oldVegetable) {
        const $newLi = generateLi(newVegetable);
        $container.replaceChild($newLi, $li);
        $li = $newLi;
        vegetable = newVegetable;
        selectedIndex.setValue(selectedIndex.getValue());
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
    vegetable.setName($form.name.value);
    vegetable.setClassification($form.classification.value);
    vegetable.setOrigin($form.origin.value);
    vegetable.setPlanted($form.planted.checked);
    vegetable.setAmount($form.amount.value);
    vegetable.setComments($form.comments.value);


    if (selectedIndex.getValue() >= 0) {
      vegetables.replace(vegetables.get(selectedIndex.getValue()), vegetable);
      selectedIndex.setValue(-1);
    } else {
      vegetables.add(vegetable);
    }
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

  const onDeleteClick = evt => {
    const val = vegetables.get(selectedIndex.getValue());
    vegetables.remove(val);
  };

  /**
   * 
   * @param {HTMLFormElement} $form 
   * @param {HTMLUListElement} $vegetables 
   * @param {HTMLButtonElement} $delete 
   */
  const onIndexChange = ($form, $vegetables, $delete) => (newIndex, oldIndex) => {
    const selectedClass = 'selected';
    if (oldIndex >= 0) {
      $vegetables.children[oldIndex].classList.remove(selectedClass);
    }
    if (newIndex >= 0) {
      $vegetables.children[newIndex].classList.add(selectedClass);
      setFormValue($form)(vegetables.get(newIndex));
      $delete.removeAttribute('disabled');
    }
    if (newIndex === -1) {
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
      $form.reset();
      selectedIndex.setValue(-1);
    });

    $form.name.oninvalid = event => event.target.classList.add('invalid');

    renderVegetableClassifications($form.classification);

    vegetables.onAdd(vegetable => createVegetableEntry($vegetables, vegetable));
    selectedIndex.onChange(onIndexChange($form, $vegetables, $delete));
  };

  initHuerto(
    document.querySelector('form'),
    document.getElementById('vegetables'),
    document.getElementById('delete'),
    document.getElementById('add'),
  );

}());
