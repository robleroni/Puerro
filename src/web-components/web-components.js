import { diff, render } from '../vdom/vdom';


export {
  PuerroElement
};


/**
 * @class PuerroElement
 * @description Abstract class which provides state to custom HTML elements.
 */
class PuerroElement extends HTMLElement {
  constructor(initialState = {}) {
    super();
    this.state = initialState;
  }

  connectedCallback() {
    this.refresh();
  }

  /**
   * Sets a new state based on a given object or function
   *
   * @param {object | Function} newState
   */
  setState(newState) {
    if (typeof newState === 'function') {
      this.state = { ...this.state, ...newState(state) };
    } else {
      this.state = { ...this.state, ...newState };
    }
    this.refresh();
  }

  /**
   * refreshes the Dom
   */
  refresh() {
    const newVNode = this.render();
    if (null == this.vNode) {
      this.prepend(render(this.render()));
    } else {
      diff(this, newVNode, this.vNode);
    }
    this.vNode = newVNode;
  }

  render() { }
}