import { h, mount } from '../../src/vdom/vdom';

const intialState = {
  num1: 0,
  num2: 0,
}

const component = ({ state, setState }) =>
  h('div', { },
    h('input', {
      type:  'number',
      name:  'num1',
      input: evt => setState({ num1: +evt.target.value })
    }),
    h('span', {}, '+'),
    h('input', {
      type:  'number',
      name:  'num2',
      input: evt => setState({ num2: +evt.target.value })
    }),
    h('span', { }, '= ' + (state.num1+state.num2)),
  )


mount(document.body, component, intialState);