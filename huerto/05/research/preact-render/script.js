import { PuerroController } from '../../../../src/mvc/controller';
import { h, render } from 'preact';


class ViewController extends PuerroController {

  repaint(newVdom) {
    render(newVdom, this.$root, this.$root.firstChild);
  }

  setName(name) {
    this.state.set({name});
  }
}

const View = controller =>
  h(
    'div',
    {},
    h('input', {
      value: controller.model.name,
      onInput: e => controller.setName(e.target.value),
    }),
    h('label', {}, controller.model.name.length)
  );

const model = {
  name: 'Puerro',
};

new ViewController(document.body, model, View);
