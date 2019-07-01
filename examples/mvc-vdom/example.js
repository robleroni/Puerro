import { PuerroController } from "../../src/mvc/controller";
import { h } from "../../src/vdom/vdom";

export { view, CounterController }

/**
 * Creates the view
 * 
 * @param {any} controller to for interacting with state
 */
const view = controller => h('div', {}, 
  h('button', { click: _ => controller.decrement() }, '-'),
  h('button', { click: _ => controller.increment() }, '+'),
  h('output', {}, controller.model.counter),
);

/**
 * Create a new CounterController
 */
class CounterController extends PuerroController {

  /**
   * Increment the counter
   */
  increment() {
    this.state.set({counter: this.model.counter + 1})
  }

  /**
   * Decrement the counter
   */
  decrement() {
    this.state.set({counter: this.model.counter - 1})
  }
}

