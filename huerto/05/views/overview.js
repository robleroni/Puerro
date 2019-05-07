import { h } from '../../../puerro/vdom/vdom.js';

export {
  view as overviewView
}

const view = controller =>
  h('label', {}, controller.getPlantedCounts() + '/' + controller.model.vegetables.length)