import { createElement, render } from '../../../../puerro/util/dom';
import { vegetableClassifications } from '../../../../assets/js/constants';
import { ObservableList, Observable } from '../../../../puerro/observable/observable';

import { Vegetable } from './vegetable';
import { h } from '../../../../puerro/util/vdom';

export { initHuerto };

const vegetables = ObservableList([]);
const selectedId = Observable(0);

const initHuerto = ($input, $output) => {
  const $form = $input.querySelector('form');
  const $delButton = $form.delete;
  const $table = $output.querySelector('table');
  const $addButton = $output.querySelector('#add');
  const $trs = $output.querySelectorAll('tr:not(:first-child)');

  vegetableClassifications
    .map(classification => createElement('option', { value: classification })(classification))
    .forEach($form.classification.appendChild.bind($form.classification));

  $trs.forEach($tr => $tr.addEventListener('click', onVegetableClick));

  $form.addEventListener('submit', onFormSubmit);

  selectedId.onChange(onSelectedVegetableChange($table));
  vegetables.onAdd(onVegetableAdd($table));
  vegetables.onReplace(onVegetableUpdate($table));
  vegetables.onRemove(onVegetableDelete($table));

  $addButton.addEventListener('click', _ => {
    vegetables.add(Vegetable());
    enableForm($form);
  });

  $delButton.addEventListener('click', onDeleteClick);

  disableForm($form);
};

const $trEntry = vegetable => {
  const tr = h('tr', { 'data-id': vegetable.getId(), class: 'selected', click: onVegetableClick }, [
    h('td', {}, vegetable.getName()),
    h('td', {}, vegetable.getClassification()),
    h('td', {}, vegetable.getOrigin()),
    h('td', {}, vegetable.getAmount()),
    h('td', {}, vegetable.getComments()),
  ]);

  return render(tr);
};

const disableForm = $form => {
  $form.style.opacity = 0.3;
  [...$form.elements].forEach($element => ($element.disabled = true));
};

const enableForm = $form => {
  $form.style.opacity = 1;
  [...$form.elements].forEach($element => ($element.disabled = false));
};

const onVegetableAdd = $table => vegetable => {
  $table.appendChild($trEntry(vegetable));
  selectedId.set(vegetable.getId());
};

const onVegetableUpdate = $table => vegetable => {
  const $trs = $table.querySelectorAll('tr:not(:first-child)');

  if (vegetable.getId() < 1) return;

  const $oldTr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
  $table.replaceChild($trEntry(vegetable), $oldTr);
  selectedId.set(vegetable.getId());
};

const onVegetableDelete = $table => vegetable => {
  const $trs = $table.querySelectorAll('tr:not(:first-child)');

  if (vegetable.getId() < 1) return;

  const $oldTr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());
  $table.removeChild($oldTr);
};

const onVegetableClick = event => {
  selectedId.set(event.target.parentElement.getAttribute('data-id'));
};

const onDeleteClick = event => {
  if (vegetables.getAll().length < 1) return;
  const vegetable = vegetables.getAll().find(v => v.getId() == selectedId.get());

  if (
    vegetables.indexOf(vegetable) === 0 &&
    vegetables.indexOf(vegetable) === vegetables.getAll().length - 1
  ) {
    selectedId.set(0);
    vegetables.remove(vegetable);
    disableForm(event.target.parentElement);
    return;
  }

  if (vegetables.indexOf(vegetable) === vegetables.getAll().length - 1) {
    selectedId.set(vegetables.get(vegetables.indexOf(vegetable) - 1).getId());
    vegetables.remove(vegetable);
    return;
  }

  selectedId.set(vegetables.get(vegetables.indexOf(vegetable) + 1).getId());
  vegetables.remove(vegetable);
};

const onSelectedVegetableChange = $table => vegetableId => {
  const $trs = $table.querySelectorAll('tr:not(:first-child)');

  [...$trs].forEach($tr => $tr.classList.remove('selected'));

  if (vegetableId < 1) return;

  [...$trs]
    .filter($tr => $tr.getAttribute('data-id') == vegetableId)
    .forEach($tr => $tr.classList.add('selected'));

  const $form = document.querySelector('form');
  const vegetable = vegetables.getAll().find(v => v.getId() == vegetableId);

  $form.name.value = vegetable.getName();
  $form.classification.value = vegetable.getClassification();
  $form.origin.value = vegetable.getOrigin();
  $form.planted.checked = vegetable.getPlanted();
  $form.amount.value = vegetable.getAmount();
  $form.comments.value = vegetable.getComments();
};

const onFormSubmit = event => {
  event.preventDefault(); // Prevent Form Submission

  const $form = event.target;
  const vegetable = vegetables.getAll().find(v => v.getId() == selectedId.get());
  const newVegetable = Object.assign({}, vegetable);

  newVegetable.setName($form.name.value);
  newVegetable.setClassification($form.classification.value);
  newVegetable.setOrigin($form.origin.value);
  newVegetable.setPlanted($form.planted.checked);
  newVegetable.setAmount($form.amount.value);
  newVegetable.setComments($form.comments.value);

  vegetables.replace(vegetable, newVegetable);
};
