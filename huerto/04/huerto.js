import { h, render } from '../../src/vdom/vdom';
import { ObservableList, Observable } from '../../src/observable/observable';

import { vegetableClassifications } from '../../assets/js/constants';
import { Vegetable } from './vegetable';

export {
  vegetables,
  selectedVegetable,
  initHuerto,
  addVegetable,
  updateVegetable,
  deleteVegetable,
  onFormSubmit,
  onVegetableRowClick,
  trEntry,
  disableForm,
  enableForm,
  selectTr,
  fillForm,
  onPlantedChecked,
  onClassification,
  renderVegetableClassifications,
};

const vegetables = ObservableList([]);
const selectedVegetable = Observable(null);

const initHuerto = ($input, $output) => {
  const $form = $input.querySelector('form');
  const $delButton = $form.delete;
  const $table = $output.querySelector('table');
  const $addButton = $output.querySelector('#add');
  const $trs = $output.querySelectorAll('tr:not(:first-child)');

  renderVegetableClassifications($form.classification);

  $form.addEventListener('submit', onFormSubmit);
  $trs.forEach($tr => $tr.addEventListener('click', onVegetableRowClick));

  selectedVegetable.onChange(selectTr($table));
  selectedVegetable.onChange(fillForm($form));

  vegetables.onAdd(addVegetable($table));
  vegetables.onAdd(_ => enableForm($form));

  vegetables.onReplace(updateVegetable($table));

  vegetables.onRemove(deleteVegetable($table));
  vegetables.onRemove(_ => (vegetables.getAll().length ? enableForm($form) : disableForm($form)));

  $addButton.addEventListener('click', _ => vegetables.add(Vegetable()));
  $delButton.addEventListener('click', _ => vegetables.remove(selectedVegetable.get()));

  $form.planted.addEventListener('change', onPlantedChecked($form.amount));
  $form.classification.addEventListener('change', onClassification($form.asia)('Tubers'));
  $form.classification.addEventListener('change', onClassification($form.america)('Fungi'));
};

/**
 * Adds a vegetable to given table
 *
 * @param {HTMLTableElement} $table
 */
const addVegetable = $table => vegetable => {
  $table.appendChild(render(trEntry(vegetable)));
  selectedVegetable.set(vegetable);
};

/**
 * Updates a vegetable in the given table
 *
 * @param {HTMLTableElement} $table
 */
const updateVegetable = $table => vegetable => {
  const $trs = $table.querySelectorAll('tr:not(:first-child)');
  const $tr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
  $table.replaceChild(render(trEntry(vegetable)), $tr);
  selectedVegetable.set(vegetable);
};

/**
 * Deletes a vegetable in the given table
 *
 * @param {HTMLTableElement} $table
 */
const deleteVegetable = $table => vegetable => {
  if (null == vegetable) return;

  const $trs = $table.querySelectorAll('tr:not(:first-child)');
  const $tr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());

  if ($tr.previousSibling) {
    selectedVegetable.set(
      vegetables.getAll().find(v => v.getId() == $tr.previousSibling.getAttribute('data-id'))
    );
  }

  if ($tr.nextSibling) {
    selectedVegetable.set(
      vegetables.getAll().find(v => v.getId() == $tr.nextSibling.getAttribute('data-id'))
    );
  }

  $table.removeChild($tr);
};

/**
 * Handle form submit event
 *
 * @param {Event} event
 */
const onFormSubmit = event => {
  event.preventDefault(); // Prevent Form Submission

  if (null == selectedVegetable.get()) return;

  const $form = event.target;
  const vegetable = Object.assign({}, selectedVegetable.get()); // copy

  vegetable.setName($form.name.value);
  vegetable.setClassification($form.classification.value);
  vegetable.setOrigin($form.origin.value);
  vegetable.setPlanted($form.planted.checked);
  vegetable.setAmount($form.amount.value);
  vegetable.setComments($form.comments.value);

  vegetables.replace(selectedVegetable.get(), vegetable);
};

/**
 * Handles row click event
 *
 * @param {Event} event
 */
const onVegetableRowClick = event => {
  const $table = event.target.parentElement;
  const vegetable = vegetables.getAll().find(v => v.getId() == $table.getAttribute('data-id'));
  selectedVegetable.set(vegetable);
};

/**
 * Handles planted click
 *
 * @param {HTMLElement} $amount
 */
const onPlantedChecked = $amount => event => {
  $amount.style.display = event.target.checked ? 'inline' : 'none';
};

/**
 * Handles classification changes
 *
 * @param {HTMLElement} $origin
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
 * Creates a virtual TR with the vegetable data of the given vegetable
 *
 * @param {import('./vegetable').Vegetable} vegetable
 */
const trEntry = vegetable => {
  return h('tr', { 'data-id': vegetable.getId(), click: onVegetableRowClick }, [
    h('td', {}, vegetable.getName()),
    h('td', {}, vegetable.getClassification()),
    h('td', {}, vegetable.getOrigin()),
    h('td', { style: `opacity: ${vegetable.getPlanted() ? 1 : 0.3}` }, vegetable.getAmount()),
    h('td', {}, vegetable.getComments()),
  ]);
};

/**
 * Disables the given form
 *
 * @param {HTMLFormElement} $form
 */
const disableForm = $form => {
  $form.style.opacity = 0.3;
  [...$form.elements].forEach($element => ($element.disabled = true));
  $form.reset();
};

/**
 * Enables the given form
 *
 * @param {HTMLFormElement} $form
 */
const enableForm = $form => {
  $form.style.opacity = 1;
  [...$form.elements].forEach($element => ($element.disabled = false));
  $form.reset();
};

/**
 * Selects the TR with the given vegetable
 *
 * @param {HTMLTableElement} $table
 */
const selectTr = $table => vegetable => {
  const $trs = $table.querySelectorAll('tr:not(:first-child)');
  [...$trs].forEach($tr => $tr.classList.remove('selected'));

  if (null == vegetable) return; // no selection if null

  const $selectedTr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
  $selectedTr.classList.add('selected');
};

/**
 * Fills the form with the given vegetable
 *
 * @param {HTMLFormElement} $form
 */
const fillForm = $form => vegetable => {
  if (null == vegetable) return; // no filling if null

  $form.name.value = vegetable.getName();
  $form.classification.value = vegetable.getClassification();
  $form.origin.value = vegetable.getOrigin();
  $form.planted.checked = vegetable.getPlanted();
  $form.amount.value = vegetable.getAmount();
  $form.amount.style.display = $form.planted.checked ? 'inline' : 'none';
  $form.comments.value = vegetable.getComments();
};

/**
 * Renders the vegetable classifications
 * @param {HTMLElement} $select
 */
const renderVegetableClassifications = $select => {
  vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
};
