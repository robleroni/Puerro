import { describe } from '../../../../src/test/test';
import { sum } from './script';

describe('Research - 01 - Testability', test => {
  test('adding numbers', assert => {
    // given
    const a = 1;
    const b = 2;

    // when
    const result = sum(a, b);

    // then
    assert.is(result, 3);
  });
});
