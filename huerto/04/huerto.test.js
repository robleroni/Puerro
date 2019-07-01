import { describe } from '../../src/test/test';
import { createDomElement } from '../../src/vdom/vdom';
import { Vegetable } from './vegetable';
import {
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
} from './huerto';

describe('Huerto - 04', test => {
  test('renderVegetableClassifications', assert => {
    // given
    const $select = document.createElement('select');

    // when
    renderVegetableClassifications($select);

    // then
    assert.is($select.children.length, 10);
  });

  test('onFormSubmit', assert => {
    // given
    /*const form = {
      name: createDomElement('input', { value: 'tomato' }),
      classification: { value: 'fruit' },
      origin: { value: 'Europe' },
      planted: { checked: true },
      amount: { value: '4' },
      comments: { value: 'needs water daily' },
    };*/

    // before
    assert.is(vegetables.count(), 0);

    // when
    vegetables.add(Vegetable());

    // then
    assert.is(vegetables.count(), 1);
  });

  test('onPlantedChecked', assert => {
    // given
    const $checkbox = document.createElement('input');
    const $amount = document.createElement('input');

    // when
    onPlantedChecked($amount)({ target: $checkbox });

    // then
    assert.is($amount.style.display, 'none');

    // when
    $checkbox.checked = true;
    onPlantedChecked($amount)({ target: $checkbox });

    // then
    assert.is($amount.style.display, 'inline');
  });

  test('onClassification', assert => {
    // given
    const classification = {};
    const $origin = document.createElement('input');

    // when
    classification.value = 'Fungi';
    onClassification($origin)('Fungi')({ target: classification });

    // then
    assert.is($origin.disabled, true);
    assert.is($origin.checked, false);

    // when
    classification.value = 'Fruits';
    onClassification($origin)('Fungi')({ target: classification });

    // then
    assert.is($origin.disabled, false);
  });

  test('add Vegetable', assert => {
    // given
    const $table = createDomElement('table');
    $table.appendChild(createDomElement('tr')); // adding header

    const vegetable = Vegetable();
    vegetable.setName('Tomato');

    // when
    addVegetable($table)(vegetable);

    // then
    const $tr = $table.querySelector('tr:not(:first-child)');
    assert.is($table.children.length, 2);
    assert.true($tr.textContent.includes('Tomato'));
  });

  test('delete Vegetable', assert => {
    // given
    const $table = createDomElement('table');
    $table.appendChild(createDomElement('tr')); // adding header

    const vegetable = Vegetable();
    vegetable.setName('Tomato');
    vegetables.add(vegetable);

    //when
    addVegetable($table)(vegetable);

    // then
    const $tr = $table.querySelector('tr:not(:first-child)');
    assert.is($table.children.length, 2);
    assert.true($tr.textContent.includes('Tomato'));

    // when
    deleteVegetable($table)(vegetable);

    // then
    assert.is($table.children.length, 1);
  });
});
