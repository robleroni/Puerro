import { describe } from '../../puerro/test/test';
import { ENTER_KEYCODE, registerAddingVegetableEvent } from './huerto';

describe('01 - Huerto', test => {
  test('add Vegetable', assert => {
    // given
    const $vegetableInput = document.createElement('input');
    const $vegetables     = document.createElement('ul');
    registerAddingVegetableEvent($vegetableInput, $vegetables);

    // when
    $vegetableInput.value = 'leek';
    $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

    // then
    assert.is($vegetables.children.length, 1);
    assert.is($vegetables.innerHTML, '<li>leek</li>');
    assert.is($vegetableInput.value, '');

    // when
    $vegetableInput.value = 'tomato';
    $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

    // then
    assert.is($vegetables.children.length, 2);
    assert.is($vegetables.innerHTML, '<li>leek</li><li>tomato</li>');
    assert.is($vegetableInput.value, '');
  });
});
