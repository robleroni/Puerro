import { PuerroElement } from '../../src/web-components/web-components';
import { h } from '../../src/vdom/vdom';

export { PuerroInputComponent, MainComponent }

/**
 * Create a new PuerroInput Component
 */
class PuerroInputComponent extends PuerroElement {
  /**
   * Returns the selector of the element
   */
  static get Selector() { return 'puerro-input' };

  /**
   * Returns the label
   */
  get label() {
    return this.hasAttribute('label') && this.getAttribute('label');
  }

  /**
   * Sets the label
   * @param value label to be set
   */
  set label(value) {
    if (null == value) {
      this.removeAttribute('label');
    } else {
      this.setAttribute('label');
      this.refresh();
    }
  }

  /**
   * Dispatches the value changed event.
   * @param {Event} evt 
   */
  _onInput(evt) {
    this.dispatchEvent(new CustomEvent('valueChanged', { detail: evt.target.value }));
  }

  /**
   * Renders the view
   * 
   * @override
   */
  render() {
    return h('input', {
      type: 'number',
      name: 'name',
      placeholder: this.label,
      input: evt => this._onInput(evt)
    })
  }
}

/**
 * Creats a new Main Component
 */
class MainComponent extends PuerroElement {
  /**
  * Returns the selector of the element
  */
  static get Selector() { return 'puerro-main' };

  /**
   * Sets the initail state
   */
  constructor() {
    super({ num1: 0, num2: 0 });
  }

  /**
   * Renders the view
   * 
   * @override
   */
  render() {
    return h('div', {},
      h(PuerroInputComponent.Selector, { label: 'num1', valueChanged: evt => this.setState({ num1: +evt.detail }) }),
      h('span', {}, '+'),
      h(PuerroInputComponent.Selector, { label: 'num2', valueChanged: evt => this.setState({ num2: +evt.detail }) }),
      h('span', {}, '= ' + (this.state.num1 + this.state.num2)),
    )
  }
}