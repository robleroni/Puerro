import { render } from 'preact';
import { PuerroController } from './controller';

export {
  PreactController
}

class PreactController extends PuerroController {
  init() {
    this.store.onChange(s => this.refresh());
    this.state.onChange(s => this.refresh());
  }

  repaint(newVdom) {
    render(newVdom, this.$root, this.$root.firstChild);
  }
}
