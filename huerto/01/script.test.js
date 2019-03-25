import { describe } from '../../puerro/test/test';
import { Huerto, ENTER_KEYCODE } from './script';

describe('huerto 01', test => {
  test('renderVegetables', assert => {
    // given
    const $vegetable = document.createElement('input'),
      $vegetables = document.createElement('ul');
    Huerto($vegetable, $vegetables);

    // when
    $vegetable.value = 'tomato';
    $vegetable.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

    // then
    assert.is($vegetables.innerHTML, '<li>tomato</li>');
    assert.is($vegetable.value, '');
  });
});
