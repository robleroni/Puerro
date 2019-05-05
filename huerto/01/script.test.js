import { describe } from '../../puerro/test/test';
import { Huerto, ENTER_KEYCODE } from './script';

describe('01 - Huerto', test => {
  test('add Vegetable', assert => {
    // given
    const $vegetableInput = document.createElement('input');
    const $vegetables     = document.createElement('ul');
    Huerto($vegetableInput, $vegetables);

    // when
    $vegetableInput.value = 'puerro';
    $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

    // then
    assert.is($vegetables.children.length, 1);
    assert.is($vegetables.innerHTML, '<li>puerro</li>');
    assert.is($vegetableInput.value, '');

    // when
    $vegetableInput.value = 'tomato';
    $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

    // then
    assert.is($vegetables.children.length, 2);
    assert.is($vegetables.innerHTML, '<li>puerro</li><li>tomato</li>');
    assert.is($vegetableInput.value, '');
  });
});
