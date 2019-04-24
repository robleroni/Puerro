import { h, render } from '../../../../puerro/vdom/vdom';
import { ObservableList, Observable } from '../../../../puerro/observable/observable';

import { vegetableClassifications } from '../../../../assets/js/constants';
import { Vegetable } from './vegetable';

export { initHuerto };

const vegetables = ObservableList([]);
const selectedVegetable = Observable(null);

const initHuerto = ($input, $output) => {
  const $form = $input.querySelector('form');
  const $delButton = $form.delete;
  const $table = $output.querySelector('table');
  const $addButton = $output.querySelector('#add');
  const $trs = $output.querySelectorAll('tr:not(:first-child)');

  vegetableClassifications.forEach(c => $form.classification.append(render(h('option', {}, c))));

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

  disableForm($form);
};

const addVegetable = $table => vegetable => {
  $table.appendChild(render(trEntry(vegetable)));
  selectedVegetable.set(vegetable);
};

const updateVegetable = $table => vegetable => {
  const $trs = $table.querySelectorAll('tr:not(:first-child)');
  const $tr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
  $table.replaceChild(render(trEntry(vegetable)), $tr);
  selectedVegetable.set(vegetable);
};

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

const onVegetableRowClick = event => {
  const $table = event.target.parentElement;
  const vegetable = vegetables.getAll().find(v => v.getId() == $table.getAttribute('data-id'));
  selectedVegetable.set(vegetable);
};

const trEntry = vegetable => {
  return h('tr', { 'data-id': vegetable.getId(), click: onVegetableRowClick }, [
    h('td', {}, vegetable.getName()),
    h('td', {}, vegetable.getClassification()),
    h('td', {}, vegetable.getOrigin()),
    h('td', {}, vegetable.getAmount()),
    h('td', {}, vegetable.getComments()),
  ]);
};

const disableForm = $form => {
  $form.style.opacity = 0.3;
  [...$form.elements].forEach($element => ($element.disabled = true));
};

const enableForm = $form => {
  $form.style.opacity = 1;
  [...$form.elements].forEach($element => ($element.disabled = false));
};

const selectTr = $table => vegetable => {
  const $trs = $table.querySelectorAll('tr:not(:first-child)');
  [...$trs].forEach($tr => $tr.classList.remove('selected'));

  if (null == vegetable) return; // no selection if null

  const $selectedTr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
  $selectedTr.classList.add('selected');
};

const fillForm = $form => vegetable => {
  if (null == vegetable) return; // no filling if null

  $form.name.value = vegetable.getName();
  $form.classification.value = vegetable.getClassification();
  $form.origin.value = vegetable.getOrigin();
  $form.planted.checked = vegetable.getPlanted();
  $form.amount.value = vegetable.getAmount();
  $form.comments.value = vegetable.getComments();
};
