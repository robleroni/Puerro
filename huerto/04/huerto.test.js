import { describe } from '../../puerro/test/test';
import {
  renderVegetableClassifications,
  onFormSubmit,
  onPlantedChecked,
  onClassification,
  createVegetableEntry,
  vegetables,
} from './huerto';
import { createElement } from '../../puerro/util/dom';
import { Vegetable } from './vegetable';

describe('05 Huerto', test => {
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

    const $template = document.createElement('div');
    $template.innerHTML = `
    <template id="vegetable-entry">
      <li>
        <span></span>
        <button>Delete</button>
      </li>
    </template>`;
    document.body.appendChild($template);

    // when
    createVegetableEntry($ul, vegetable);

    // then
    const $span = $ul.querySelector('span');
    assert.is($ul.children.length, 1);
    assert.true($span.textContent.includes('Tomato'));
  });

  test('remove Vegetable', assert => {
    // given
    const $ul = document.createElement('ul');
    const vegetable = Vegetable();
    vegetable.setName('Tomato');

    // when
    createVegetableEntry($ul, vegetable);

    // then
    const $span = $ul.querySelector('span');
    assert.is($ul.children.length, 1);
    assert.true($span.textContent.includes('Tomato'));

    // given
    const $delButton = $ul.querySelector('button');

    // when
    $delButton.dispatchEvent(new KeyboardEvent('click'));

    // then
    assert.is($ul.children.length, 0);
  });
});
