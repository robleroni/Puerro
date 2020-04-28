import { h, mount } from '../../../../src/vdom/vdom';
import { vegetableClassifications, origins } from '../../../../assets/js/constants';

/**
 * @typedef {{ id: number, name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
 * @typedef {{ vegetables: Vegetable[], form: Vegetable, selected: Vegetable }} FormState
 */

const initialFormState = {
  name: '',
  classification: 'Tubers',
  origin: '',
  amount: 1,
  comments: '',
}

const initialState = {
  nextId: 1,
  vegetables: [],
  selected: null,
  form: {...initialFormState},
};

const actions = {
  setName: name => state => { state.form.name = name },
  setClassification: classification => state => {state.form.classification = classification},
  setOrigin: origin => state => { state.form.origin = origin },
  setAmount: amount => state => { state.form.amount = amount },
  setComments: comments => state => { state.form.comments = comments },
  addVegetable: vegetable => state => { state.vegetables = [...state.vegetables, vegetable] },
  setNextId: id => state => { state.nextId = id },
  selectVegetable: id => state => { 
    state.selected = id;
    state.form = null == id ? {...initialFormState} : {...state.vegetables.find(v => v.id === id)};
  },
  replaceVegetable: (id, newV) => state => {
    state.vegetables = state.vegetables.map(v => 
      v.id === id ? newV : v
    )
  }
}

/**
 *
 * Creates a Form Field
 *
 * @param {string} label
 * @param {import('../../../../src/vdom/vdom').VNode} element
 */
const formField = (label, element) => {
  return h('div', {}, [h('label', {}, label), element]);
};

const onFormSubmit = ({ state, setState }) => event => {
  event.preventDefault();
  if (null == state.selected) {
    const vegetable = {...state.form, id: state.nextId };
    setState(actions.addVegetable(vegetable));
    setState(actions.setNextId(state.nextId + 1));
    setState(actions.selectVegetable(vegetable.id));
  } else {
    setState(actions.replaceVegetable(state.form.id, state.form));
    setState(actions.selectVegetable(state.form.id));
  }
}

const form = ({ state, setState }) => {
  const form = state.form;
  return h('form', { submit: onFormSubmit({ state, setState })}, [
    formField('Name', h('input', { value: form.name, change: (event) => setState(actions.setName(event.target.value)), required: true })),
    formField('Classification', h('select', { value: form.classification, change: (event) => setState(actions.setClassification(event.target.value))  },
        vegetableClassifications.map(c =>
          h('option', { value: c, selected: c === form.classification ? true : undefined }, c)
        )
      )
    ),
    formField('Origin', h('div', {},
      origins.map(o => [
        h('input', {
          id: o.name, type: 'radio', name: 'origin', value: o.name, 
          checked: !o.disabledOn.includes(form.classification) && o.name === form.origin ? true : undefined,
          disabled: o.disabledOn.includes(form.classification) ? true : undefined,
          required: true,
          change: event => setState(actions.setOrigin(event.target.value))
      }),
        h('label', {for: o.name}, o.name)
      ]).reduce((acc, val) => acc.concat(val), [])
    )),
    formField('Amount', h('div', {},
      [
        h('input', {type: 'checkbox', checked: form.amount > 0 ? true: undefined, change: (event) => setState(actions.setAmount(event.target.checked ? 1 : 0))}),
        h('label', {}, 'Planted'),
        h('input', {type: 'number', min: 1, value: form.amount, change: (event) => setState(actions.setAmount(event.target.value)), style: `display: ${form.amount > 0 ? 'inline' : 'none'}`})
      ]
    )),
    formField('Comments', h('textarea', { change: (event) => setState(actions.setComments(event.target.value)) }, form.comments)),
    h('button', {}, 'Save')
  ]);
}

/**
 * 
 * @param {Object} obj 
 * @param {FormState} obj.state 
 * @param {functtion(): void} obj.setState 
 */
const vegetableTable = ({ state, setState }) => {
  return h('table', {}, [
    h('thead', {}, [
      h('tr', {}, [
        h('td', {}, 'Name'),
        h('td', {}, 'Classification'),
        h('td', {}, 'Origin'),
        h('td', {}, 'Amount'),
      ])
    ]),
    h('tbody', {}, state.vegetables.map(v => 
      h('tr', { style: `color: ${v.id === state.selected ? 'red' : 'black'}`, click: event => setState(actions.selectVegetable(v.id)) },  [
        h('td', {}, v.name),
        h('td', {}, v.classification),
        h('td', {}, v.origin),
        h('td', {}, v.amount),
      ]))
    )
  ])
}

/**
 *
 * @param {Object} obj 
 * @param {FormState} obj.state 
 * @param {functtion(): void} obj.setState 
 *
 * @returns {import('../../../../src/vdom/vdom').VNode}
 */
const view = ({ state, setState }) => {
  return h('main', {}, [
    h('div', {}, [
      h('button', { click: event => setState(actions.selectVegetable(null)) }, '+'),
      form({ state, setState }),
    ]),
    h('div', { class: 'output' }, [ 
      h('h3', {}, 'My vegetables'),
      vegetableTable({ state, setState })
    ])
  ])
};

mount(document.querySelector('body'), view, initialState);
