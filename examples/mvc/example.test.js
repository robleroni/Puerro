import { describe } from '../../src/test/test';

import { Model, Controller } from './example';

describe('Examples - MVC with Observables', test => {

  // before
  const model = Model();
  const controller = Controller(model);

  test('interact with controller', assert => {
    // inital
    assert.is(model.name.get(), '');
    assert.is(model.age.get(),   0);

    // when
    controller.setName('Puerro');
    controller.increaseAge();

    // then
    assert.is(model.name.get(), 'Puerro');
    assert.is(model.age.get(),   1);

    // when
    controller.setName('Huerto');
    controller.decreaseAge()

    // then
    assert.is(model.name.get(), 'Huerto');
    assert.is(model.age.get(),   0);
  });
});
