import { test } from '../../util/test';
import {createElement} from './dom';

test('createElement with plain text', assert => {
  // given
  const tagName = 'div';
  const content = 'test123';

  // when
  const $el = createElement(tagName)(content);

  // then
  assert.is($el.innerText, content);
  assert.is($el.tagName.toLowerCase(), tagName);
});

test('createElement with child nodes', assert => {
  // given
  const tagName = 'ul';
  const content = `
    <li>test</li>
    <li>123</li>
  `;

  // when
  const $el = createElement(tagName)(content);

  //  then
  assert.is($el.childElementCount, 2);
  assert.is($el.childElementCount, 2);
});