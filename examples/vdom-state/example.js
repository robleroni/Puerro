import { h } from '../../src/vdom/vdom';

export { view }

/**
 * Creates a view with the given state interface
 * 
 * @param {object} object used for state managemend 
 */
const view = ({ state, setState }) =>
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