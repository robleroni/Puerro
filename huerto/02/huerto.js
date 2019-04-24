import { createDomElement, render } from '../../puerro/util/dom';
import { h } from '../../puerro/util/vdom';
import { vegetableClassifications } from '../../assets/js/constants';

export { renderVegetableClassifications, onFormSubmit, onPlantedChecked, initHuerto };

/**
 * Creates the vegetable output string
 *
 * @param {HTMLFormElement} $form
 */
const createVegetableOutputString = $form =>
  `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

/**
 * Renders the Vegetable Classifications
 *
 * @param {HTMLSelectElement} $select
 */
const renderVegetableClassifications = $select => {
  vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
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
  $list.appendChild(createDomElement('li', {}, createVegetableOutputString(event.target)));
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
 * Constructor function to create the Huerto UI
 *
 * @param {HTMLFormElement} $form - Input element to add new vegetables
 * @param {HTMLElement} $vegetables - Container for the vegetables
 */
const initHuerto = ($form, $vegetables) => {
  $form.addEventListener('submit', onFormSubmit($vegetables));
  $form.planted.addEventListener('change', onPlantedChecked($form.amount));

  renderVegetableClassifications($form.classification);
};
