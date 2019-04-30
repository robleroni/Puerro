import { h } from '../../../../../puerro/vdom/vdom';

export {
  view as multiplyView
}

/**
 *
 * @param {Object} obj
 * @param {import('../models').State} obj.state
 */
const view = (controller) =>
  h('div', {},
    h('h3', {}, 'count1 * count2'),
    h('div', {}, controller.model.count1 * controller.model.count2)
  )