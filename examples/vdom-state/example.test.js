import { describe } from '../../src/test/test';
import { view } from './example';

describe('Examples - State Management with virtual DOM', test => {
  test('sum numbers', assert => {
    // given
    const setState = () => {};
    const state = {
      num1: 2,
      num2: 3
    }

    // when
    const vDOM = view({ state, setState });

    // then
    assert.is(vDOM.children[vDOM.children.length - 1].children[0], '= 5');
  });
});
