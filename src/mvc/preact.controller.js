import { render } from 'preact';
import { PuerroController } from './controller';

export { PreactController }

/**
 * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
 */

/**
 * Controller to use a MVC approach using the virtual DOM renderer of [preact](http://preactjs.com).
 */
class PreactController extends PuerroController {
  
  /**
   * Initial function of the Preact Controller
   */
  init() {
    this.store.onChange(s => this.refresh());
    this.state.onChange(s => this.refresh());
  }

  /**
   * Painting virtual DOM with the preact renderer.
   * 
   * @param {VNode} newVdom vDom to be paintend
   */
  repaint(newVdom) {
    render(newVdom, this.$root, this.$root.firstChild);
  }
}
