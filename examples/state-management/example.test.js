import { describe } from '../../src/test/test';
import { component } from './example';

describe('vDOM', test => {
  test('sum numbers', assert => {
    // given
    const setState = () => {};
    const state = {
      num1: 2,
      num2: 3
    }

    // when
    const vDOM = component({ state, setState });

    // then
    assert.is(vDOM.children[vDOM.children.length - 1].children[0], '= 5');
  });
});
