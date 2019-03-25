import { describe } from '../test/test';
import { vNode, createNode, render } from './vdom';

describe('vdom util', test => {
  test('createElement with plain text', assert => {
    // given
    const tagName = 'div';
    const content = 'test123';

    // when
    const $el = createNode(vNode(tagName)()(content));

    // then
    assert.is($el.innerText, content);
    assert.is($el.tagName.toLowerCase(), tagName);
  });

  test('createElement with child nodes', assert => {
    // given
    const tagName = 'ul';
    const content = [vNode('li')()('test'), vNode('li')()('123')];

    // when
    const $el = createNode(vNode(tagName)()(content));

    //  then
    assert.is($el.childElementCount, 2);
  });

  test('createElement with attribute', assert => {
    // given
    const tagName = 'p';
    const content = 'test';
    const attributes = { style: 'color: green' };

    // when
    const $el = createNode(vNode(tagName)(attributes)(content));

    // then
    assert.is($el.getAttribute('style'), 'color: green');
  });
});
