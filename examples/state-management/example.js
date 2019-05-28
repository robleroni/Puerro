import { h } from '../../src/vdom/vdom';

export {
  component
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