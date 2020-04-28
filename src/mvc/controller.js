import { render, diff } from '../vdom/vdom';
import { ObservableObject } from '../observable/observable';

export { PuerroController };

/**
 * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
 */

/**
 * Global store object
 */
const store = ObservableObject({});

/**
 * Abstract controller to use a MVC approach using the virtual DOM as a renderer.
 */
class PuerroController {

  /**
   * Creating a new PuerroController
   * 
   * @param {HTMLElement} $root DOM element to mount view
   * @param {object} state initial state
   * @param {function(controller): VNode} view Virtual DOM creator
   * @param {boolean} diffing if diffing should be used
   */
  constructor($root, state, view, diffing = true) {
    this.$root = $root;
    this.state = ObservableObject({ ...state });
    this.view = view;
    this.diffing = diffing;
    this.vDom = null;
    this.init();
    this.onInit();
  }

  /**
   * Initial function of the Puerro Controller
   */
  init() {
    this.vDom = this.view(this);
    this.$root.prepend(render(this.vDom));
    this.store.onChange(s => this.refresh());
    this.state.onChange(s => this.refresh());
  }

  /**
   * On Init Hook 
   */
  onInit() {}

  /**
   * Refreshs the view
   */
  refresh() {
    const newVDom = this.view(this);
    this.repaint(newVDom);
    this.vDom = newVDom;
  }

  /**
   * Repaint the virtual DOM using the DOM API
   * 
   * @param {VNode} newVDom vDom to be paintend
   */
  repaint(newVDom) {
    if (this.diffing) {
      diff(this.$root, newVDom, this.vDom);
    } else {
      this.$root.replaceChild(render(newVDom), this.$root.firstChild);
    }
  }

  /**
   * Returns the model (store and state)
   */
  get model() {
    return { ...store.get(), ...this.state.get() };
  }

  /**
   * Returns the store
   */
  get store() { return store; }

  /**
   * Static method for returning the store
   */
  static get store() { return store; }
}
