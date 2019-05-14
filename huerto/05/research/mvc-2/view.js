import { h } from '../../../../src/vdom/vdom';

export { view };

const view = controller =>
  h('div', {}, [
    h('input', { input: evt => controller.setName(evt.target.value) }),
    h('span', {}, controller.getMessage()),
  ]);
