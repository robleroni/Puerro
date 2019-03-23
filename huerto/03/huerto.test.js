import { describe } from '../../puerro/util/test';
import {
  renderVegetableClassifications,
  onFormSubmit,
  onPlantedChecked,
  onClassification,
} from './huerto';

describe('03 Huerto', test => {
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
      name: { value: 'tomato' },
      classification: { value: 'fruit' },
      origin: { value: 'Europe' },
      planted: { checked: true },
      amount: { value: '4' },
      comments: { value: 'needs water daily' },
    };

    const $list = document.createElement('ul');

    // when
    onFormSubmit($list)({ preventDefault: () => undefined, target: form });

    // then
    assert.is($list.children.length, 1);
    assert.is(
      $list.children[0].textContent,
      'tomato (fruit) from Europe, planted (4), needs water daily'
    );
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
    assert.is($origin.style.display, 'none');

    // when
    classification.value = 'Fruits';
    onClassification($origin)('Fungi')({ target: classification });

    // then
    assert.is($origin.style.display, 'inline');
  })
});
