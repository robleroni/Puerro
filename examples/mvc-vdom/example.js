import { Controller } from "../../src/mvc/controller";
import { h } from "../../src/vdom/vdom";

export {
  model, view, MyController
}

const model = {
  counter: 0
};

const view = controller => h('div', {}, 
  h('button', { click: _ => controller.decrement() }, '-'),
  h('button', { click: _ => controller.increment() }, '+'),
  h('output', {}, controller.model.counter),
);

class MyController extends Controller {

  increment() {
    this.state.set({counter: this.model.counter + 1})
  }

  decrement() {
    this.state.set({counter: this.model.counter - 1})
  }
}

