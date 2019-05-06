import { Controller } from '../../../../puerro/mvc/controller';
import { h, render } from 'preact';

class ViewController extends Controller {
  init() {
    this.refresh();
  }

  refresh(state) {
    this.model = { ...this.model, ...state };
    this.vDom = this.view(this);
    render(this.vDom, this.$root, this.$root.firstChild);
  }

  setName(name) {
    this.refresh({ name });
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
