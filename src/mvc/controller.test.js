import { describe } from '../test/test';
import { h } from '../vdom/vdom';
import { PuerroController } from './controller';
import { PreactController } from './preact.controller';

describe('MVC Controller with virtual DOM', test => {
  test('Puerro Controller', assert => {
    // before
    class MyController extends PuerroController {
      increment() {
        this.state.push('counter', this.model.counter + 1);
      }
    }

    // given
    const $div = document.createElement('div');                      // DOM
    const model = { counter: 0 };                                    // model
    const view = controller => h('p', {}, controller.model.counter); // view
    const controller = new MyController($div, model, view);          // controller

    // inital state
    assert.is(controller.model.counter, 0);
    assert.is($div.firstChild.textContent, '0');

    // when
    controller.increment();

    // then
    assert.is(controller.model.counter, 1);
    assert.is($div.firstChild.textContent, '1');
  });

  test('Preact Controller', assert => {
    // before
    class MyController extends PreactController {
      increment() {
        this.state.push('counter', this.model.counter + 1);
      }
    }

    // given
    const $div = document.createElement('div');                      // DOM
    const model = { counter: 0 };                                    // model
    const view = controller => h('p', {}, controller.model.counter); // view
    const controller = new MyController($div, model, view);          // controller

    // inital state
    assert.is(controller.model.counter, 0);
    assert.is($div.firstChild.textContent, '0');

    // when
    controller.increment();

    // then
    assert.is(controller.model.counter, 1);
    assert.is($div.firstChild.textContent, '1');
  });
});
