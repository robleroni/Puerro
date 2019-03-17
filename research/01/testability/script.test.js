import { describe } from '../../../puerro/util/test';
import sum from './script';

describe('01 - Research', test => {
  test('adding numbers', assert => {
    // given
    const a = 2;
    const b = 2;

    // when
    const result = sum(a, b);

    // then
    assert.is(result, 4);
  });
});
