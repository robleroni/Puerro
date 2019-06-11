import { h } from "../../../../src/vdom/vdom";
import { PuerroController } from "../../../../src/mvc/controller";

export { model, ResultController, View }

const model = {
    counter1: 0,
    counter2: 0,
    sum:      0,
    product:  0,
};

class ResultController extends PuerroController {
    setCounter1(counter) {
        this.state.push('counter1', counter)
        this.state.push('sum',      this.model.counter1 + this.model.counter2);
        this.state.push('product',  this.model.counter1 * this.model.counter2);
    }

    setCounter2(counter) {
        this.state.push('counter2', counter)
        this.state.push('sum',      this.model.counter1 + this.model.counter2);
        this.state.push('product',  this.model.counter1 * this.model.counter2);
    }
}

const View = controller => h('div', {}, 
    h('label', {}, 'Sum:    ' + controller.model.sum ),
    h('br'),
    h('label', {}, 'Product:' + controller.model.product),
);