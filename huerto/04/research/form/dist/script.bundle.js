(function () {
  'use strict';

  /**
   * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
   */

  /**
   * Creates a node object which can be rendered
   *
   * @param {string} tagName
   * @param {object} attributes
   * @param {VNode[] | VNode | any} node
   *
   * @returns {VNode}
   */
  const vNode = (tagName, attributes = {}, ...nodes) => ({
    tagName,
    attributes,
    children: [].concat(...nodes), // collapse nested arrays.
  });

  /**
   * Converts a DOM Node to a Virtual Node
   *
   * @param {HTMLElement} $node
   *
   * @returns {VNode}
   */
  const toVNode = $node => {
    const tagName = $node.tagName;
    const $children = $node.children;

    const attributes = Object.values($node.attributes).reduce((attributes, attribute) => {
      attributes[attribute.name] = attribute.value;
      return attributes;
    }, {});

    if ($children.length > 0) {
      return vNode(tagName, attributes, Array.from($children).map(toVNode));
    }

    return vNode(tagName, attributes, $node.textContent);
  };

  /**
   * Creates a new HTMLElement
   * @param {string} tagName
   *
   * @returns {function(content): HTMLElement}
   */
  const createElement = (tagName, attributes = {}) => content => {
    const $element = document.createElement(tagName);
    if (content) {
      $element.innerHTML = content;
    }
    Object.keys(attributes)
      .filter(key => null != attributes[key]) // don't render attributes with value null/undefined
      .forEach(key => {
        if (typeof attributes[key] === 'function') {
          $element.addEventListener(key, attributes[key]);
        } else {
          $element.setAttribute(key, attributes[key]);
        }
      });
    return $element;
  };

  /**
   * renders a given node object
   *
   * @param {import('./vdom').VNode} node
   *
   * @returns {HTMLElement}
   */
  const render = node => {
    if (null == node) {
      return document.createTextNode('');
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return document.createTextNode(node);
    }
    const $element = createElement(node.tagName, node.attributes)('');
    node.children.forEach(c => $element.appendChild(render(c)));
    return $element;
  };

  const vegetableClassifications = [
    'Bulbs',
    'Flowers',
    'Fruits',
    'Fungi',
    'Leaves',
    'Roots',
    'Seeds',
    'Stems',
    'Tubers',
  ];

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

  };

  const initialState = {
    name: {
      attributes: {
        value: 'Peter'
      }
    }
  };


  const init = () => {
    const $form = document.querySelector('form');
    renderVegetableClassifications($form.classification);

    const form = toVNode($form);

    Object.keys(initialState).forEach(id => applyState(id, initialState[id])(form));
    $form.replaceWith(render(form));
  };

  init();

}());
