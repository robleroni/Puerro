import { describe } from '../../../src/test/test';
import { createDomElement } from '../../../src/vdom/vdom';
import { PuerroController as Controller } from '../../../src/mvc/controller';
import { ListController } from '../controllers/list';
import { listModel } from '../models/list';
import { listView } from '../views/list';


describe('Huerto - 05 - ListController', test => {
  // before
  Controller.store.set({ vegetables: [{ id: 1 }] });
  const $root = createDomElement('div');
  const controller = new ListController($root, listModel, listView);

  test('Render list', assert => {
    const $tds = $root.querySelectorAll('td');
    assert.is($tds.length, 5);
    assert.is($tds[0].innerText, '1');
  });

  test('Initial State', assert => {
    assert.is(Controller.store.get().vegetables.length, 1);
    assert.is(Object.keys(Controller.store.get().vegetables[0]).length, 1);
    assert.is(
      Object.entries(controller.state.get()).toString(),
      Object.entries(listModel).toString()
    );
  });

  test('addVegetable', assert => {
    // when
    controller.addVegetable();

    // then
    assert.is(Controller.store.get().vegetables.length, 2);
    assert.is(controller.state.get().selected.id, 1);
  });

  test('selectVegetable', assert => {
    // when
    controller.selectVegetable(Controller.store.get().vegetables[0]);

    // then
    assert.is(Controller.store.get().vegetables[0], controller.state.get().selected);
  });
})