import { h } from '../../../puerro/vdom/vdom.js';

export {
  view as formView
}

const originField = (origin, controller) => [
  h('input', { 
    type:    'radio', 
    name:    'origin', 
    checked: controller.model.origin == origin ? true : undefined,
    value:   origin,
    change:  evt => controller.setVegetable({ origin: evt.target.value })
  }),
  h('label', {}, origin)
]

const view = controller =>
  h('form', { submit: evt => { evt.preventDefault(); controller.save(); } },
    h('fieldset', { /*disabled: controller.model.id <= 0 ? true : undefined*/ },
      
      h('label', {}, 'Vegetable'),
      h('input', { 
        value: controller.model.name, 
        change: evt => controller.setVegetable({ name: evt.target.value })
      }),

      h('label', {}, 'Classification'),
      h('select', { 
        value: controller.model.classification, 
        change: evt => controller.setVegetable({ classification: evt.target.value })
      }),

      h('div', {}, 
        originField('Europe',  controller),
        originField('Asia',    controller),
        originField('America', controller),
      ),

      h('label', {}, 'Amount'),
      h('div', {},
        h('input', { type: 'checkbox'}),
        h('label', {}, 'Planted'),
        h('input', { 
          type: 'number',
          value: controller.model.amount,
          change: evt => controller.setVegetable({ amount: evt.target.value}),
        })
      ),

      h('label', {}, 'Comments'),
      h('textarea', {
        change: evt => controller.setVegetable({ comments: evt.target.value}),
      }, controller.model.comments),

      h('div', {}, 
        h('button', {}, 'Save'),
        h('button', { type: 'reset' }, 'Clear'),
        h('button', {}, 'Delete'),
      ),

    ),
  );