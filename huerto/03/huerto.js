import { createDomElement } from '../../src/vdom/vdom';
import { vegetableClassifications } from '../../assets/js/constants';

export {
  initHuerto,
  onFormSubmit,
  onPlantedChecked,
  onClassification,
  renderVegetableClassifications,
};

/**
 * Constructor function to create the Huerto UI
 *
 * @param {HTMLFormElement} $form   - Input element to add new vegetables
 * @param {HTMLElement} $vegetables - Container for the vegetables
 */
const initHuerto = ($form, $vegetables) => {
  $form               .addEventListener('submit', onFormSubmit($vegetables));
  $form.planted       .addEventListener('change', onPlantedChecked($form.amount));
  $form.classification.addEventListener('change', onClassification($form.asia)('Tubers'));
  $form.classification.addEventListener('change', onClassification($form.america)('Fungi'));

  $form.name.oninvalid = event => event.target.classList.add('invalid');

  renderVegetableClassifications($form.classification);

};

/**
 * Event handler for subbmiting the form.
 * It appends the Vegetable Output String to the given list.
 *
 * @param {HTMLUListElement} $list
 * @returns {function(Event): void}
 */
const onFormSubmit = $list => event => {
  event.preventDefault(); // Prevent Form Submission
  $list.appendChild(createDomElement('li', {}, vegetableOutputString(event.target)));
  event.target.name.classList.remove('invalid');
};

/**
 * Event Handler for the amount input.
 * It changes the display style based on the planted checkbox
 *
 * @param {HTMLInputElement} $amount
 * @returns {function(Event): void}
 */
const onPlantedChecked = $amount => event => {
  $amount.style.display = event.target.checked ? 'inline' : 'none';
};

/**
 * Event Handler for the classification dependent validation
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
 * Renders the Vegetable Classifications
 *
 * @param {HTMLSelectElement} $select
 */
const renderVegetableClassifications = $select => {
  vegetableClassifications.forEach(c => $select.append(createDomElement('option', {}, c)));
};


/**
 * Creates the vegetable output string
 *
 * @param {HTMLFormElement} $form
 */
const vegetableOutputString = $form =>
  `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;
