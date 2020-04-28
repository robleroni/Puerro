import { describe } from '../../src/test/test';
import { appendInput, changeLabel } from './example';
import { createDomElement } from '../../src/vdom/vdom';

describe('Examples - DOM API', test => {
  test('appendInput', assert => {
    // given
    const $input = createDomElement('input', { value: 'Puerro' });
    const $output = createDomElement('div');

    // when
    const $element = appendInput($input, $output)(); // event object not needed

    // then
    assert.is($output.children.length, 1);
    assert.is($element.tagName, 'P');
    assert.is($element.textContent, 'Puerro');
  });

  test('changeLabel', assert => {
    // given
    const $input = createDomElement('input', { value: 'Puerro' });
    const $button = createDomElement('button', { type: 'button' });

    // when
    changeLabel($button)({ target: $input }); // mocking event object

    // then
    assert.is($button.textContent, 'Save: Puerro');
  });
});
