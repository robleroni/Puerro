import { describe } from '../test/test';
import { changed } from './vdom';

describe('diff util', test => {
  test('nodeChanged', assert => {
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

  test('attributesChanged', assert => {
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
