import { describe } from '../test/test';
import { createDomElement } from './dom';

describe('dom util', test => {
  test('createDomElement with plain text', assert => {
    // given
    const tagName = 'div';
    const content = 'test123';

    // when
    const $el = createDomElement(tagName, {}, content);

    // then
    assert.is($el.innerText, content);
    assert.is($el.tagName.toLowerCase(), tagName);
  });

  test('createDomElement with child nodes', assert => {
    // given
    const tagName = 'ul';
    const content = `
      <li>test</li>
      <li>123</li>
    `;

    // when
    const $el = createDomElement(tagName, {}, content);

    //  then
    assert.is($el.childElementCount, 2);
  });

  test('createDomElement with attribute', assert => {
    // given
    const tagName = 'p';
    const content = 'test';
    const attributes = { style: 'color: green' };

    // when
    const $el = createDomElement(tagName, attributes, content);

    // then
    assert.is($el.getAttribute('style'), 'color: green');
  });
});
