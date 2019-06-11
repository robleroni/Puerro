import { h } from "../../../../src/vdom/vdom";
import { PuerroController } from "../../../../src/mvc/controller";

export { model, CounterController, View}

const model = { counter: 0 }

class CounterController extends PuerroController {
    increment() {
        this.state.push('counter', ++this.model.counter)
    }

    decrement() {
        this.state.push('counter', --this.model.counter)
    }
}

const View = controller => h('div', {}, 
    h('button', { click: _ => controller.decrement()}, '-'),
    h('label', {}, controller.model.counter),
    h('button', { click: _ => controller.increment()}, '+')
)