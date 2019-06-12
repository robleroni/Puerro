import { describe } from '../../src/test/test';
import { createDomElement } from '../../src/vdom/vdom';
import {
  renderVegetableClassifications,
  onFormSubmit,
  onPlantedChecked,
  onClassification,
} from './huerto';

describe('Huerto - 03', test => {

  test('adding vegetable', assert => {
    // given
    const form = {
      name:           createDomElement('input', { value:   'leek' }), // creating DOM Element for validation purposes
      classification: { value:   'fruit' },
      origin:         { value:   'Europe' },
      planted:        { checked: true },
      amount:         { value:   '4' },
      comments:       { value:   'needs water daily' },
    };

    const $list = document.createElement('ul');

    // when
    onFormSubmit($list)({ preventDefault: () => undefined, target: form });

    // then
    assert.is($list.children.length, 1);
    assert.is(
      $list.children[0].textContent,
      'leek (fruit) from Europe, planted (4), needs water daily'
    );

    // when
    form.name.value = 'tomato'
    onFormSubmit($list)({ preventDefault: () => undefined, target: form });

    // then
    assert.is($list.children.length, 2);
    assert.is(
      $list.children[1].textContent,
      'tomato (fruit) from Europe, planted (4), needs water daily'
    );
  });

  test('onPlantedChecked', assert => {
    // given
    const $checkbox = document.createElement('input');
    const $amount   = document.createElement('input');

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

  test('renderVegetableClassifications', assert => {
    // given
    const $select = document.createElement('select');

    // when
    renderVegetableClassifications($select);

    // then
    assert.is($select.children.length, 10);
  });
});
