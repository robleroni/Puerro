import { render } from 'preact';
import { Controller } from './controller';

export {
  PreactController
}

class PreactController extends Controller {
  init() {
    this.store.onChange(s => this.refresh());
    this.state.onChange(s => this.refresh());
  }

  repaint(newVdom) {
    render(newVdom, this.$root, this.$root.firstChild);
  }
}
