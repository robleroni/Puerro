import { describe } from '../test/test';
import { h, render, diff, mount, changed, createDomElement } from './vdom';

describe('DOM', test => {

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

describe('Virtual DOM', test => {

  test('render', assert => {
    // given
    const vDOM = h('div', {}, h('h1', {id: 'puerro'}, 'Puerro'));

    // when
    const $dom = render(vDOM);

    // then
    assert.is($dom.innerHTML, '<h1 id="puerro">Puerro</h1>');
  })

  test('mount', assert => {
    // given
    const $root = document.createElement('main');
    const state = { counter: 1 };
    const view = ({state, setState}) => 
      h('div', {}, 
        h('button', { click: _ => setState({counter: state.counter+2 })}), 
        h('p', {}, state.counter));

    mount($root, view, state);

    // initial state
    assert.is($root.innerHTML, '<div><button></button><p>1</p></div>')

    // when
    $root.querySelector('button').click();

    // then
    assert.is($root.innerHTML, '<div><button></button><p>3</p></div>');
  })

  test('diffing - nodeChanged', assert => {
    // given
    let node1 = 1,
      node2 = 1;

    // when
    let result = changed(node1, node2);

    // then
    assert.is(result, false);

    // when
    node2 = 2;
    result = changed(node1, node2);

    // then
    assert.is(result, true);

    // when
    node2 = { tagName: 'p' };
    result = changed(node1, node2);

    // then
    assert.is(result, true);

    // when
    node1 = { tagName: 'p' };
    result = changed(node1, node2);

    // then
    assert.is(result, false);
  });

  test('diffing - attributesChanged', assert => {
    // given
    let node1 = { attributes: { test: 1 } };
    let node2 = { attributes: { test: 1 } };

    // when
    let result = changed(node1, node2);

    // then
    assert.is(result, false);

    // when
    node2.attributes.test = 2;
    result = changed(node1, node2);

    // then
    assert.is(result, true);

    // when
    delete node2.attributes.test;
    result = changed(node1, node2);

    // then
    assert.is(result, true);
  });
});
