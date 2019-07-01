import { describe } from '../../../src/test/test';
import { createDomElement } from '../../../src/vdom/vdom';
import { PuerroController as Controller } from '../../../src/mvc/controller';
import { OverviewController } from '../controllers/overview';
import { overviewView } from '../views/overview';


describe('Huerto - 05 - OverviewController', test => {
  // before
  Controller.store.set({ vegetables: [{ id: 1 }] });
  const $root = createDomElement('div');
  const controller = new OverviewController($root, {}, overviewView);

  test('Render overview', assert => {
    const $label = $root.querySelector('label');
    assert.is($label.innerText, '0/1');
  });

  test('Initial State', assert => {
    assert.is(Controller.store.get().vegetables.length, 1);
    assert.is(Object.keys(Controller.store.get().vegetables[0]).length, 1);
  });

  test('getPlantedCounts', assert => {
    assert.is(controller.getPlantedCounts(), 0);

    // when 
    controller.store.set({ vegetables: [{ id: 1, planted: true }] });

    // then
    assert.is(controller.getPlantedCounts(), 1);
  })
});