import { describe } from '../../puerro/test/test';
import {
  renderVegetableClassifications,
  onFormSubmit,
  onPlantedChecked,
  onClassification,
  createVegetableEntry,
  vegetables,
  onIndexChange,
  onDeleteClick,
} from './huerto';
import { createElement } from '../../puerro/util/dom';
import { Vegetable } from './vegetable';

describe('04 Huerto', test => {
  test('renderVegetableClassifications', assert => {
    // given
    const $select = document.createElement('select');

    // when
    renderVegetableClassifications($select);

    // then
    assert.is($select.children.length, 9);
  });

  test('onFormSubmit', assert => {
    // given
    const form = {
      name: createElement('input', { value: 'tomato' })(),
      classification: { value: 'fruit' },
      origin: { value: 'Europe' },
      planted: { checked: true },
      amount: { value: '4' },
      comments: { value: 'needs water daily' },
    };

    // before
    assert.is(vegetables.count(), 0);

    // when
    onFormSubmit({ preventDefault: () => undefined, target: form });

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
    const $ul = document.createElement('ul');
    const vegetable = Vegetable();
    vegetable.setName('Tomato');

    // when
    createVegetableEntry($ul, vegetable);

    // then
    const $li = $ul.querySelector('li');
    assert.is($ul.children.length, 1);
    assert.true($li.textContent.includes('Tomato'));
  });

  test('remove Vegetable', assert => {
    // given
    const $ul = document.createElement('ul');
    const vegetable = Vegetable();
    vegetable.setName('Tomato');
    vegetables.add(vegetable);

    // when
    createVegetableEntry($ul, vegetable);

    // then
    const $li = $ul.querySelector('li');
    assert.is($ul.children.length, 1);
    assert.true($li.textContent.includes('Tomato'));

    // when
    $li.click();
    onDeleteClick();

    // then
    assert.is($ul.children.length, 0);
  });
});
