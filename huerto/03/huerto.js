import { createElement } from '../../puerro/src/util/dom';

export {
  renderVegetableClassifications,
  onFormSubmit,
  onPlantedChecked,
  initHuerto,
  onClassification,
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
 *
 * @param {HTMLFormElement} $form
 */
const _vegetableOutputString = $form =>
  `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

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
const onFormSubmit = $list => event => {
  event.preventDefault(); // Prevent Form Submission
  $list.appendChild(createElement('li')(_vegetableOutputString(event.target)));
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
  $form.addEventListener('submit', onFormSubmit($vegetables));
  $form.planted.addEventListener('change', onPlantedChecked($form.amount));
  $form.classification.addEventListener('change', onClassification($form.asia)('Tubers'));
  $form.classification.addEventListener('change', onClassification($form.america)('Fungi'));

  renderVegetableClassifications($form.classification);
};
