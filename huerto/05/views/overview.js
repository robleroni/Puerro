import { h } from 'preact';

export {
  view as overviewView
}

const view = controller =>
  h('label', {}, controller.getPlantedCounts() + '/' + controller.model.vegetables.length)