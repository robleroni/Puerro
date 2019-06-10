import { describe } from '../test/test';
import { PuerroElement } from './web-components';
import { createDomElement, h } from '../vdom/vdom';

describe('Web Components', test => {

  // before
  class MyComponent extends PuerroElement {
    static get Selector() { return 'my-component' };

    _change() {
      this.innerText = 'Changed';
    }

    render() {
      return h('button', {
        type: 'button',
        click: this._change
      }, 'Act')
    }
  }

  window.customElements.define(MyComponent.Selector, MyComponent);

  test('render component', assert => {
    // given
    const $myComponent = createDomElement('my-component');

    // when
    $myComponent.refresh();

    // then
    assert.is($myComponent.innerHTML, '<button type="button">Act</button>');
  });

  test('interact with component', assert => {
    // given
    const $myComponent = createDomElement('my-component');

    // when
    $myComponent.refresh();
    $myComponent.querySelector('button').click();

    // then
    assert.is($myComponent.innerHTML, '<button type="button">Changed</button>');
  });

});
