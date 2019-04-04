import { createElement } from '../../puerro/util/dom';
import { vegetableClassifications } from '../../assets/js/constants';
import { ObservableList } from '../../puerro/observable/observable';

import { Vegetable } from './vegetable';

export {
  initHuerto,
  renderVegetableClassifications,
  onFormSubmit,
  onPlantedChecked,
  onClassification,
  createVegetableEntry,
  vegetables,
};

/**
 * @typedef {{ name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
 */

const vegetables = ObservableList([]);

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

/**
 * Constructor function to create the Huerto UI
 *
 * @param {HTMLFormElement} $form - Input element to add new vegetables
 * @param {HTMLElement} $vegetables - Container for the vegetables
 */
const initHuerto = ($form, $vegetables) => {
  $form.addEventListener('submit', onFormSubmit);
  $form.planted.addEventListener('change', onPlantedChecked($form.amount));
  $form.classification.addEventListener('change', onClassification($form.asia)('Tubers'));
  $form.classification.addEventListener('change', onClassification($form.america)('Fungi'));

  $form.name.oninvalid = event => event.target.classList.add('invalid');

  renderVegetableClassifications($form.classification);

  vegetables.onAdd(vegetable => createVegetableEntry($vegetables, vegetable));
};
