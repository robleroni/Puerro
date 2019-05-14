import { h } from '../../../../../src/vdom/vdom';

export {
  view as addView
}

/**
 *
 * @param {Object} controller
 */
const view = (controller) =>
  h('div', {},
    h('h3', {}, 'count1 + count2'),
    h('div', {}, controller.model.count1 + controller.model.count2)
  )