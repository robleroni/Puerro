import { h, render, createDomElement } from '../../../../src/vdom/vdom';
import { vegetableClassifications } from '../../../../assets/js/constants';
import { ObservableList, Observable } from '../../../../src/observable/observable';

import { Vegetable } from './vegetable';

export {
  initHuerto,
  renderVegetableClassifications,
  onIndexChange,
  onFormSubmit,
  onPlantedChecked,
  onClassification,
  createVegetableEntry,
  vegetables,
  onDeleteClick,
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
