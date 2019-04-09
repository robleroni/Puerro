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
  const h = vNode;

  /**
   * compares two VDOM nodes and returns true if they are different
   *
   * @param {VNode} node1
   * @param {VNode} node2
   */
  const changed = (node1, node2) => {
    const nodeChanged =
      typeof node1 !== typeof node2 ||
      ((typeof node1 === 'string' || typeof node1 === 'number') && node1 !== node2) ||
      node1.type !== node2.type;
    const attributesChanged =
      !!node1.attributes &&
      !!node2.attributes &&
      (Object.keys(node1.attributes).length !== Object.keys(node2.attributes).length ||
        Object.keys(node1.attributes).some(
          a =>
            node1.attributes[a] !== node2.attributes[a] &&
            (null == node1.attributes[a] ? '' : node1.attributes[a]).toString() !==
              (null == node2.attributes[a] ? '' : node2.attributes[a]).toString()
        ));
    return nodeChanged || attributesChanged;
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

  /**
   * compares two VDOM nodes and applies the differences to the dom
   *
   * @param {HTMLElement} $parent
   * @param {import('./vdom').VNode} oldNode
   * @param {import('./vdom').VNode} newNode
   * @param {number} index
   */
  const diff = ($parent, oldNode, newNode, index = 0) => {
    if (null == oldNode) {
      $parent.appendChild(render(newNode));
      return;
    }
    if (null == newNode) {
      $parent.removeChild($parent.childNodes[index]);
      return;
    }
    if (changed(oldNode, newNode)) {
      $parent.replaceChild(render(newNode), $parent.childNodes[index]);
      return;
    }
    if (newNode.tagName) {
      newNode.children.forEach((newNode, i) => {
        diff($parent.childNodes[index], oldNode.children[i], newNode, i);
      });
    }
  };

  /**
   * renders given stateful view into given container
   *
   * @param {HTMLElement} $root
   * @param {function(): import('./vdom').VNode} view
   * @param {object} initialState
   * @param {boolean} useDiffing
   */
  const mountWithActions = ($root, view, initialState, useDiffing = true) => {
    let _state = initialState;

    const refresh = () => {
      const newVDom = view(viewParams);
      
      if (useDiffing) {
        diff($root, vDom, newVDom);
      } else {
        $root.replaceChild(render(newVDom), $root.firstChild);
      }
      vDom = newVDom;
    };

    const act = action => {
      _state = action(_state, event) || _state;
      refresh();
    };

    const viewParams = {
      get state() {
        return _state;
      },
      act: act,
    };
    let vDom = view(viewParams);
    if ($root.firstChild) {
      $root.replaceChild(render(vDom), $root.firstChild);
    } else {
      $root.appendChild(render(vDom));
    }
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

  const origins = [
    {name: 'Europe',  disabledOn: []},
    {name: 'Asia',    disabledOn: ['Tubers']},
    {name: 'America',  disabledOn: ['Fungi']}
  ];

  /**
   * @typedef {{ name: string, classification: string, origin: string, amount: number, comments: string  }} VegetableForm
   * @typedef {{ form: VegetableForm }} FormState
   */

  const initialState = {
    form: {
      name: '',
      classification: 'Tubers',
      origin: '',
      amount: 1,
      comments: '',
    },
  };

  const actions = {
    setName: name => state => { state.form.name = name; },
    setClassification: classification => state => {state.form.classification = classification;},
    setAmount: amount => state => { state.form.amount = amount; },
  };

  /**
   *
   * Creates a Form Field
   *
   * @param {string} label
   * @param {import('../../../../puerro/util/vdom').VNode} element
   */
  const createFormField = (label, element) => {
    return h('div', {}, [h('label', {}, label), element]);
  };

  /**
   *
   * @param {DemoState} state
   * @param {function(DemoState): void} setState
   *
   * @returns {function(DemoState): import('../../../../puerro/util/vdom').VNode} *
   */
  const view = ({ state, act }) => {
    const form = state.form;
    return h('form', {}, [
      createFormField('Name', h('input', { value: form.name, change: (event) => act(actions.setName(event.target.value)) })),
      createFormField('Classification', h('select', { value: form.classification, change: (event) => act(actions.setClassification(event.target.value))  },
          vegetableClassifications.map(c =>
            h('option', { value: c, selected: c === form.classification ? true : undefined }, c)
          )
        )
      ),
      createFormField('Origin', h('div', {},
        origins.map(o => [
          h('input', {
            id: o.name, type: 'radio', name: 'origin', value: o.name, checked: !o.disabledOn.includes(form.classification) && o.name === form.origin ? true : undefined,
            disabled: o.disabledOn.includes(form.classification) ? true : undefined
        }),
          h('label', {for: o.name}, o.name)
        ]).reduce((acc, val) => acc.concat(val), [])
      )),
      createFormField('Amount', h('div', {},
        [
          h('input', {type: 'checkbox', checked: form.amount > 0 ? true: undefined, change: (event) => act(actions.setAmount(event.target.checked ? 1 : 0))}),
          h('label', {}, 'Planted'),
          h('input', {type: 'number', min: 1, value: form.amount, style: `display: ${form.amount > 0 ? 'inline' : 'none'}`})
        ]
      )),
      createFormField('Comments', h('textarea', {}, form.comments))
    ]);
  };

  mountWithActions(document.querySelector('main'), view, initialState);

}());
