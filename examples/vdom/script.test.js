import { describe } from '../../src/test/test';
import { createVDOM, handleClick } from './example';
import { createDomElement, render } from '../../src/vdom/vdom';

describe('vDOM', test => {
  test('createVDOM', assert => {
    // given
    const items = ['Puerro', 'Huerto'];

    // when
    const vDOM = createVDOM(items);

    // then
    assert.is(vDOM.children.length, 2);
    assert.is(render(vDOM).querySelector('td').textContent, 'Puerro'); // possibility to interact via DOM API
  });

  test('handleClick', assert => {
    // given
    const $table  = createDomElement('table', {}, '<tbody><tbody>');
    const $button = createDomElement('button', { type: 'button' });

    // when
    handleClick($table)();

    // then
    assert.is($table.querySelector('td').textContent, 'Puerro');
  });
});
