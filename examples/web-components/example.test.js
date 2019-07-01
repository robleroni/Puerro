import { describe } from '../../src/test/test';

import { PuerroInputComponent, MainComponent } from './example';
import { createDomElement } from '../../src/vdom/vdom';

describe('Examples - State Management with Web-Components', test => {
  window.customElements.define(PuerroInputComponent.Selector, PuerroInputComponent);
  window.customElements.define(MainComponent.Selector, MainComponent);

  test('PuerroInputComponent label', assert => {
    // given
    const $puerroComponent = createDomElement(PuerroInputComponent.Selector, { label: 'Test' });

    // when
    document.body.appendChild($puerroComponent);

    // then
    assert.is($puerroComponent.getAttribute('label'), 'Test');
    assert.is($puerroComponent.getElementsByTagName('input')[0].getAttribute('placeholder'), 'Test');

    // cleanup
    document.body.removeChild($puerroComponent);
  });

  test('PuerroInputComponent valueChanged', assert => {
    // given
    const onValueChanged = evt => assert.is(+evt.detail, 3);
    const $puerroComponent = createDomElement(PuerroInputComponent.Selector, { valueChanged: onValueChanged });
    const event = new Event('input');

    // when
    document.body.appendChild($puerroComponent);
    const $input = $puerroComponent.getElementsByTagName('input')[0];
    $input.value = 3;
    $input.dispatchEvent(event);

    // cleanup
    document.body.removeChild($puerroComponent);
  })
});
