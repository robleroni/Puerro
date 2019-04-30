import { render, diff } from '../vdom/vdom';

export {
  Controller
}

class Controller {
  constructor($root, model, view, diffing = true) {
    this.$root = $root;
    this.model = model;
    this.view = view;
    this.diffing = diffing;
    this.vDom = null;
    this.init();
  }

  init() {
    this.vDom = this.view(this)
    this.$root.prepend(render(this.vDom));
  }

  refresh(state) {
    this.model = { ...this.model, ...state }
    console.log(state, this.model)
    let newVDom = this.view(this)
    if (this.diffing) {
      diff(this.$root, newVDom, this.vDom);
    } else {
      this.$root.replaceChild(render(newVDom), this.$root.firstChild);
    }
  }
}