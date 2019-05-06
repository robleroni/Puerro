import { render, diff } from '../vdom/vdom';
import { EventManager } from '../observable/observable';

export { Controller };

class Controller {
  constructor($root, model, view, diffing = true) {
    this.$root = $root;
    this.model = { ...model };
    this.view = view;
    this.diffing = diffing;
    this.vDom = null;
    this.eventManager = EventManager();
    this.init();
  }

  init() {
    this.vDom = this.view(this);
    this.$root.prepend(render(this.vDom));
  }

  refresh(state) {
    this.model = { ...this.model, ...state };
    const newVDom = this.view(this);
    if (this.diffing) {
      diff(this.$root, newVDom, this.vDom);
    } else {
      this.$root.replaceChild(render(newVDom), this.$root.firstChild);
    }
    this.vDom = newVDom;
  }
}
