import { h } from '../../../puerro/vdom/vdom.js';

export {
  view as listView
}

const view = controller =>
  h('ul', {},
    controller.model.vegetables.map(v => h('li', {}, v.name))
  )