import { PuerroElement } from '../../src/web-components/web-components';
import { h } from '../../src/vdom/vdom';

export {
  PuerroInputComponent,
  MainComponent
}

class PuerroInputComponent extends PuerroElement {
  static get Selector() { return 'puerro-input' };

  get label() {
    return this.hasAttribute('label') && this.getAttribute('label');
  }

  set label(value) {
    if (null == value) {
      this.removeAttribute('label');
    } else {
      this.setAttribute('label');
      this.refresh();
    }
  }

  _onInput(evt) {
    this.dispatchEvent(new CustomEvent('valueChanged', { detail: evt.target.value }));
  }

  /**
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

class MainComponent extends PuerroElement {
  static get Selector() { return 'puerro-main' };

  constructor() {
    super({ num1: 0, num2: 0 });
  }

  /**
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