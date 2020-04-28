(function () {
  'use strict';

  /**
   * A Module that abstracts Virtual DOM interactions.
   * It's purpose is to perform actions on DOM-like Objects
   *
   * @module vdom
   */

  /**
   * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
   */

  /**
  * Creates a new HTML Element.
  * If the attribute is a function it will add it as an EventListener.
  * Otherwise as an attribute.
  *
  * @param {string} tagName name of the tag
  * @param {object} attributes attributes or listeners to set in element
  * @param {*} innerHTML content of the tag
  *
  * @returns {HTMLElement}
  */
  const createDomElement = (tagName, attributes = {}, innerHTML = '') => {
    const $element = document.createElement(tagName);
    $element.innerHTML = innerHTML;
    Object.keys(attributes)
      .filter(key => null != attributes[key]) // don't create attributes with value null/undefined
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
   * Creates a node object which can be rendered
   *
   * @param {string} tagName
   * @param {object} attributes
   * @param {VNode[] | VNode | any} nodes
   *
   * @returns {VNode}
   */
  const vNode = (tagName, attributes = {}, ...nodes) => ({
    tagName,
    attributes: null == attributes ? {} : attributes,
    children: null == nodes ? [] : [].concat(...nodes), // collapse nested arrays.
  });
  const h = vNode;

  /**
   * Renders a given node object
   * Considers ELEMENT_NODE AND TEXT_NODE https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
   *
   * @param {VNode} node
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
    const $element = createDomElement(node.tagName, node.attributes);
    node.children.forEach(c => $element.appendChild(render(c)));
    return $element;
  };

  /**
   * Renders given stateful view into given container
   *
   * @param {HTMLElement} $root
   * @param {function(): VNode} view
   * @param {object} state
   * @param {boolean} diffing
   */
  const mount = ($root, view, state, diffing = true) => {
    const params = {
      get state() {
        return state;
      },
      setState,
    };

    let vDom = view(params);
    $root.prepend(render(vDom));

    function setState(newState) {
      if (typeof newState === 'function') {
        state = { ...state, ...newState(state) };
      } else {
        state = { ...state, ...newState };
      }
      refresh();
    }

    function refresh() {
      const newVDom = view(params);

      if (diffing) {
        diff($root, newVDom, vDom);
      } else {
        $root.replaceChild(render(newVDom), $root.firstChild);
      }

      vDom = newVDom;
    }
  };

  /**
   * Compares two VDOM nodes and applies the differences to the dom
   *
   * @param {HTMLElement} $parent
   * @param {VNode} oldNode
   * @param {VNode} newNode
   * @param {number} index
   */
  const diff = ($parent, newNode, oldNode, index = 0) => {
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
        diff($parent.childNodes[index], newNode, oldNode.children[i], i);
      });
    }
  };

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

  const vegetableClassifications = [
    '',
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
    { name: 'Europe',  disabledOn: [] },
    { name: 'Asia',    disabledOn: ['Tubers'] },
    { name: 'America', disabledOn: ['Fungi'] },
  ];

  /**
   * @typedef {{ id: number, name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
   * @typedef {{ vegetables: Vegetable[], form: Vegetable, selected: Vegetable }} FormState
   */

  const initialFormState = {
    name: '',
    classification: 'Tubers',
    origin: '',
    amount: 1,
    comments: '',
  };

  const initialState = {
    nextId: 1,
    vegetables: [],
    selected: null,
    form: {...initialFormState},
  };

  const actions = {
    setName: name => state => { state.form.name = name; },
    setClassification: classification => state => {state.form.classification = classification;},
    setOrigin: origin => state => { state.form.origin = origin; },
    setAmount: amount => state => { state.form.amount = amount; },
    setComments: comments => state => { state.form.comments = comments; },
    addVegetable: vegetable => state => { state.vegetables = [...state.vegetables, vegetable]; },
    setNextId: id => state => { state.nextId = id; },
    selectVegetable: id => state => { 
      state.selected = id;
      state.form = null == id ? {...initialFormState} : {...state.vegetables.find(v => v.id === id)};
    },
    replaceVegetable: (id, newV) => state => {
      state.vegetables = state.vegetables.map(v => 
        v.id === id ? newV : v
      );
    }
  };

  /**
   *
   * Creates a Form Field
   *
   * @param {string} label
   * @param {import('../../../../src/vdom/vdom').VNode} element
   */
  const formField = (label, element) => {
    return h('div', {}, [h('label', {}, label), element]);
  };

  const onFormSubmit = ({ state, setState }) => event => {
    event.preventDefault();
    if (null == state.selected) {
      const vegetable = {...state.form, id: state.nextId };
      setState(actions.addVegetable(vegetable));
      setState(actions.setNextId(state.nextId + 1));
      setState(actions.selectVegetable(vegetable.id));
    } else {
      setState(actions.replaceVegetable(state.form.id, state.form));
      setState(actions.selectVegetable(state.form.id));
    }
  };

  const form = ({ state, setState }) => {
    const form = state.form;
    return h('form', { submit: onFormSubmit({ state, setState })}, [
      formField('Name', h('input', { value: form.name, change: (event) => setState(actions.setName(event.target.value)), required: true })),
      formField('Classification', h('select', { value: form.classification, change: (event) => setState(actions.setClassification(event.target.value))  },
          vegetableClassifications.map(c =>
            h('option', { value: c, selected: c === form.classification ? true : undefined }, c)
          )
        )
      ),
      formField('Origin', h('div', {},
        origins.map(o => [
          h('input', {
            id: o.name, type: 'radio', name: 'origin', value: o.name, 
            checked: !o.disabledOn.includes(form.classification) && o.name === form.origin ? true : undefined,
            disabled: o.disabledOn.includes(form.classification) ? true : undefined,
            required: true,
            change: event => setState(actions.setOrigin(event.target.value))
        }),
          h('label', {for: o.name}, o.name)
        ]).reduce((acc, val) => acc.concat(val), [])
      )),
      formField('Amount', h('div', {},
        [
          h('input', {type: 'checkbox', checked: form.amount > 0 ? true: undefined, change: (event) => setState(actions.setAmount(event.target.checked ? 1 : 0))}),
          h('label', {}, 'Planted'),
          h('input', {type: 'number', min: 1, value: form.amount, change: (event) => setState(actions.setAmount(event.target.value)), style: `display: ${form.amount > 0 ? 'inline' : 'none'}`})
        ]
      )),
      formField('Comments', h('textarea', { change: (event) => setState(actions.setComments(event.target.value)) }, form.comments)),
      h('button', {}, 'Save')
    ]);
  };

  /**
   * 
   * @param {Object} obj 
   * @param {FormState} obj.state 
   * @param {functtion(): void} obj.setState 
   */
  const vegetableTable = ({ state, setState }) => {
    return h('table', {}, [
      h('thead', {}, [
        h('tr', {}, [
          h('td', {}, 'Name'),
          h('td', {}, 'Classification'),
          h('td', {}, 'Origin'),
          h('td', {}, 'Amount'),
        ])
      ]),
      h('tbody', {}, state.vegetables.map(v => 
        h('tr', { style: `color: ${v.id === state.selected ? 'red' : 'black'}`, click: event => setState(actions.selectVegetable(v.id)) },  [
          h('td', {}, v.name),
          h('td', {}, v.classification),
          h('td', {}, v.origin),
          h('td', {}, v.amount),
        ]))
      )
    ])
  };

  /**
   *
   * @param {Object} obj 
   * @param {FormState} obj.state 
   * @param {functtion(): void} obj.setState 
   *
   * @returns {import('../../../../src/vdom/vdom').VNode}
   */
  const view = ({ state, setState }) => {
    return h('main', {}, [
      h('div', {}, [
        h('button', { click: event => setState(actions.selectVegetable(null)) }, '+'),
        form({ state, setState }),
      ]),
      h('div', { class: 'output' }, [ 
        h('h3', {}, 'My vegetables'),
        vegetableTable({ state, setState })
      ])
    ])
  };

  mount(document.querySelector('body'), view, initialState);

}());
