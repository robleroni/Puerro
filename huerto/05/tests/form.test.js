import { describe } from '../../../src/test/test';
import { createDomElement } from '../../../src/vdom/vdom';
import { FormController } from '../controllers/form';
import { formModel } from '../models/form';
import { formView } from '../views/form';
import { PuerroController as Controller } from '../../../src/mvc/controller';

describe('Huerto - 05 - FormController', test => {
  // before
  Controller.store.set({ vegetables: [{ id: 1 }] });
  const $root = createDomElement('div');
  const controller = new FormController($root, formModel, formView);

  // given
  const vegetable = {
    id: 1,
    name: 'Leek',
    classification: 'Fruits',
    origin: 'Asia',
    planted: true,
    amount: 4,
    comments: 'needs water daily',
  };

  test('Rendering Form', assert => {
    assert.is($root.querySelectorAll('option').length, 10);
  });

  test('Initial State', assert => {
    assert.is(Controller.store.get().vegetables.length, 1);
    assert.is(Object.keys(Controller.store.get().vegetables[0]).length, 1);
    assert.is(
      Object.entries(controller.state.get()).toString(),
      Object.entries(formModel).toString()
    );
  });

  test('Save Vegetable', assert => {

    //given
    controller.setVegetable(vegetable);

    // when
    controller.save();

    // then
    assert.is(Controller.store.get().vegetables.length, 1);
    assert.is(
      Object.entries(Controller.store.get().vegetables[0]).toString(),
      Object.entries(vegetable).toString()
    );
    assert.is(
      Object.entries(controller.state.get()).toString(),
      Object.entries(vegetable).toString()
    );
    assert.is($root.querySelector('textArea').value, 'needs water daily');
  });

  test('Reset Vegetable', assert => {
    // when
    controller.reset();

    // then
    assert.is(Controller.store.get().vegetables.length, 1);
    assert.is(Object.keys(Controller.store.get().vegetables[0]).length, 7);
    assert.is(
      Object.entries(controller.state.get()).toString(),
      Object.entries({ ...formModel, ...{ id: 1 } }).toString()
    );
    assert.is($root.querySelector('textArea').value, '');
  });

  test('Delete Vegetable', assert => {
    // when
    controller.delete();

    // then
    assert.is(Controller.store.get().vegetables.length, 0);
    assert.is(
      Object.entries(controller.state.get()).toString(),
      Object.entries({ ...formModel, ...{ id: 1 } }).toString()
    );
    assert.is($root.querySelector('textArea').value, '');
  });
});
