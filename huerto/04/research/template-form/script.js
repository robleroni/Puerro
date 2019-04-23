import { toVNode } from '../../../../puerro/util/vdom';
import { render, createElement, mount } from '../../../../puerro/util/dom';
import { vegetableClassifications } from '../../../../assets/js/constants';

/**
 * Renders the vegetable classifications
 * @param {HTMLSelectElement} $select
 */
const renderVegetableClassifications = $select => {
  vegetableClassifications
    .map(classification => createElement('option', { value: classification })(classification))
    .forEach($select.appendChild.bind($select));
};

const initialState = {
  data: {
    name: 'Tomato',
    origin: 'Fungi',
  },

  methods: {},
};

const huertoForm = vNode => state => {
  vNode.children[2].attributes.value = state.state.data.name;
  return vNode;
};

const init = () => {
  const $main = document.querySelector('main');

  // TODO: There must be a better way..
  const $template = document.querySelector('#form-template');
  const $form = $template.content.querySelector('form');

  renderVegetableClassifications($form.classification);

  const form = toVNode($form);

  mount($main, huertoForm(form), initialState);
};

init();
