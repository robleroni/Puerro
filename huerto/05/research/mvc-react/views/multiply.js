import { h } from '../../../../../src/vdom/vdom';

export {
  view as multiplyView
}

/**
 * 
 * @param {Object} obj 
 * @param {import('../models').State} obj.state 
 */
const view = (controller) => 
  h('div', {}, h('h3', {}, 'count1 * count2'), h('div', {}, controller.getCount1() * controller.getCount2()))