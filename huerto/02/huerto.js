import { createElement } from '../../puerro/util/dom';

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
const createVegetableOutputString = $form =>
  `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

/**
 *
 * @param {HTMLSelectElement} $select
 */
export const renderVegetableClassifications = $select => {
  vegetableClassifications
    .map(classification => createElement('option', { value: classification })(classification))
    .forEach($select.appendChild.bind($select));
};

/**
 *
 * @param {HTMLUListElement} $list
 * @returns {function(Event): void}
 */
export const onFormSubmit = $list => event => {
  event.preventDefault(); // Prevent Form Submission
  $list.appendChild(createElement('li')(createVegetableOutputString(event.target)));
};

/**
 *
 * @param {HTMLInputElement} $amount
 * @returns {function(Event): void}
 */
export const onPlantedChecked = $amount => event => {
  $amount.style.display = event.target.checked ? 'inline' : 'none';
};

/**
 * Constructor function to create the Huerto UI
 *
 * @param {HTMLFormElement} $form - Input element to add new vegetables
 * @param {HTMLElement} $vegetables - Container for the vegetables
 */
export const initHuerto = ($form, $vegetables) => {
  $form.addEventListener('submit', onFormSubmit($vegetables));
  $form.planted.addEventListener('change', onPlantedChecked($form.amount));

  renderVegetableClassifications($form.classification);
};
