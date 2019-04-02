import { h } from '../../../../puerro/util/vdom';
import { mount } from '../../../../puerro/util/dom';
import { vegetableClassifications, origins } from '../../../../assets/js/constants';

/**
 * @typedef {{ name: string, classification: string, origin: string, amount: number, comments: string  }} VegetableForm
 * @typedef {{ form: VegetableForm }} FormState
 */

const initialState = {
  form: {
    name: '',
    classification: '',
    origin: '',
    amount: 1,
    comments: '',
  },
};

/**
 *
 * @param {HTMLInputElement} $origin
 */
const onClassification = $origin => value => event => {
  $origin.disabled = false;
  $origin.labels.forEach(label => (label.style.opacity = '1'));

  if (event.target.value === value) {
    $origin.disabled = true;
    $origin.checked = false;
    $origin.labels.forEach(label => (label.style.opacity = '0.5'));
  }
};

const originIsDisabled = (origin, formState, ) => {

}

/**
 *
 * Creates a Form Field
 *
 * @param {string} label
 * @param {import('../../../../puerro/util/vdom').VNode} element
 */
const createFormField = (label, element) => {
  return h('div', {}, [h('label', {}, label), element]);
};

/**
 *
 * @param {DemoState} state
 * @param {function(DemoState): void} setState
 *
 * @returns {function(DemoState): import('../../../../puerro/util/vdom').VNode} *
 */
const view = (getState, setState) => {
  const form = getState().form;
  return h('form', {}, [
    createFormField('Name', h('input', { value: form.name, change: (event) => setState({form: {...getState().form, name: event.target.value}}) })),
    createFormField('Classification', h('select', { value: form.classification },
        vegetableClassifications.map(c =>
          h('option', { value: c, selected: c === form.classification ? true : undefined }, c)
        )
      )
    ),
    createFormField('Origin', h('div', {}, 
      origins.map(o => [
        h('input', {
          id: o.name, type: 'radio', name: 'origin', value: o.name, checked: o.name === form.origin ? true : undefined,
          disabled: o.disabledOn.includes(form.classification) ? true : undefined
      }), 
        h('label', {for: o.name}, o.name)
      ]).reduce((acc, val) => acc.concat(val), [])
    )),
    createFormField('Amount', h('div', {}, 
      [
        h('input', {type: 'checkbox', checked: form.amount > 0 ? true: undefined, change: (event) => setState({
          form: {...form, amount: event.target.checked ? 1 : 0}
        })}),
        h('label', {}, 'Planted'),
        h('input', {type: 'number', min: 1, value: form.amount, style: `display: ${form.amount > 0 ? 'inline' : 'none'}`})
      ]
    )),
    createFormField('Comments', h('textarea', {}, form.comments))
  ]);
};

mount(document.querySelector('main'), view, initialState, false);
