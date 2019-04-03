import { toVNode } from "../../../../puerro/util/vdom";
import { render, createElement } from "../../../../puerro/util/dom";
import { vegetableClassifications } from "../../../../assets/js/constants";

/**
 *
 * @param {HTMLSelectElement} $select
 */
const renderVegetableClassifications = $select => {
  vegetableClassifications
    .map(classification => createElement('option', { value: classification })(classification))
    .forEach($select.appendChild.bind($select));
};

/**
 * 
 * @param {import("../../../../puerro/util/vdom").VNode} vNode 
 */
const applyState = (id, state) => vNode => {

  if (null != vNode.attributes && vNode.attributes.id === id) {
    vNode.attributes.value = state.attributes.value;
  }

  if (Array.isArray(vNode.children)) {
    // currently doesn't end when id is found
    vNode.children.forEach(applyState(id, state));
  }

}

const initialState = {
  name: {
    attributes: {
      value: 'Peter'
    }
  }
}


const init = () => {
  const $form = document.querySelector('form');
  renderVegetableClassifications($form.classification)

  const form = toVNode($form);

  Object.keys(initialState).forEach(id => applyState(id, initialState[id])(form));
  $form.replaceWith(render(form));
}

init();