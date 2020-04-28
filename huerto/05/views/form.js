import { h } from 'preact';
import { vegetableClassifications, origins } from '../../../assets/js/constants.js';

export {
  view as formView
}

const originField = (origin, controller) => [
  h('input', {
    value:    origin.name,
    id:       'radio-origin-' + origin.name,
    name:     'origin',
    type:     'radio',
    required: true,
    disabled: origin.disabledOn.includes(controller.model.classification) ? true : undefined,
    checked:  controller.model.origin == origin.name
                && !origin.disabledOn.includes(controller.model.classification) ? true : undefined,
    onChange: evt => controller.setVegetable({ origin: evt.target.value })
  }),
  h('label', { for: 'radio-origin-' + origin.name }, origin.name)
]

const view = controller => h('form', { onSubmit: evt => { evt.preventDefault(); controller.save(); } },
    h('fieldset', { disabled: controller.model.id <= 0 ? true : undefined },

      h('label', {}, 'Vegetable'),
      h('input', {
        value:    controller.model.name,
        name:     'name',
        required: true,
        onChange: evt => controller.setVegetable({ name: evt.target.value })
      }),

      h('label', {}, 'Classification'),
      h('select', {
        value:    controller.model.classification,
        name:     'classification',
        required: true,
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
          name:     'planted',
          type:     'checkbox',
          checked:  controller.model.planted ? true : undefined,
          onChange: evt => controller.setVegetable({ planted: evt.target.checked })
        }),
        controller.model.planted ? h('input', {
          value:    controller.model.amount,
          name:     'amount',
          type:     'number',
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
        h('button', { type: 'button', onClick: evt => controller.delete() }, 'Delete'),
      ),

    ),
  );