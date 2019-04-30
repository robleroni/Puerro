import { h } from '../../../puerro/vdom/vdom.js';

export {
  view as formView
}

const formField = (label, element) => {
  return h('div', {}, [h('label', {}, label), element]);
};

const view = controller =>
  h('form', { submit: evt => {evt.preventDefault(); controller.save();} },
    formField('name', h('input', {
        value: controller.model.name,
        change: evt => controller.setName(evt.target.value)
      })
    ),
  )