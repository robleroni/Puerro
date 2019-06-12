import { describe } from '../../src/test/test';
import { onFormSubmit, onPlantedChecked, renderVegetableClassifications } from './huerto';

describe('Huerto - 02', test => {

  test('adding vegetable', assert => {
    // given
    const form = {
      name:           { value:   'leek' },
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

  test('renderVegetableClassifications', assert => {
    // given
    const $select = document.createElement('select');

    // when
    renderVegetableClassifications($select);

    // then
    assert.is($select.children.length, 10);
  });
});
