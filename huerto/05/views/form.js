import { h } from 'preact';
import { vegetableClassifications, origins } from '../../../assets/js/constants.js';

export {
  view as formView
}

const originField = (origin, controller) => [
  h('input', { 
    type:    'radio', 
    name:    'origin', 
    id:      'radio-origin-' + origin.name,
    checked: controller.model.origin == origin.name ? true : undefined,
    value:   origin.name,
    required: true,
    disabled: origin.disabledOn.includes(controller.model.classification) ? true : undefined,
    onChange:  evt => controller.setVegetable({ origin: evt.target.value })
  }),
  h('label', { for: 'radio-origin-' + origin.name }, origin.name)
]

const view = controller => h('form', { onSubmit: evt => { evt.preventDefault(); controller.save(); } },
    h('fieldset', { disabled: controller.model.id <= 0 ? true : undefined },
      
      h('label', {}, 'Vegetable'),
      h('input', { 
        name: 'name',
        value:  controller.model.name, 
        required: true,
        onChange: evt => controller.setVegetable({ name: evt.target.value })
      }),

      h('label', {}, 'Classification'),
      h('select', { 
        value:  controller.model.classification,
        onChange: evt => controller.setVegetable({ classification: evt.target.value })
      }, vegetableClassifications.map(classification => 
          h('option', { 
            value:    classification, 
            selected: controller.model.classification === classification ? true : undefined
          }, classification)
        )
      ),

      h('div', {}, 
        origins.map(o => originField(o, controller))
      ),

      h('label', {}, 'Amount'),
      h('div', {},
        h('label', {}, 'Planted'),
        h('input', { 
          type:    'checkbox', 
          checked: controller.model.planted ? true : undefined, 
          onChange:  evt => controller.setVegetable({ planted: evt.target.checked }) 
        }),
        controller.model.planted ? h('input', { 
          type:   'number',
          value:  controller.model.amount,
          onChange: evt => controller.setVegetable({ amount: evt.target.value}),
        }) : null
      ),

      h('label', {}, 'Comments'),
      h('textarea', {
        onChange: evt => controller.setVegetable({ comments: evt.target.value}),
      }, controller.model.comments),

      h('div', {}, 
        h('button', {}, 'Save'),
        h('button', { type: 'reset', onClick: evt => controller.reset(evt) }, 'Clear'),
        h('button', { onClick: evt => controller.delete() }, 'Delete'),
      ),

    ),
  );