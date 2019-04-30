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
   * Creates a new HTML Element.
   * If the attribute is a function it will add it as an EventListener.
   * Otherwise as an attribute.
   *
   * @param {string} tagName name of the tag
   * @param {object} attributes attributes or listeners to set in element
   * @param {*} innerHTML content of the tag
   *
   * @returns {function(content): HTMLElement}
   */
  const createDomElement = (tagName, attributes = {}, innerHTML = '') => {
    const $element = document.createElement(tagName);
    $element.innerHTML = innerHTML;
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
    const $element = createDomElement(node.tagName, node.attributes);
    node.children.forEach(c => $element.appendChild(render(c)));
    return $element;
  };

  /**
   * Compares two VDOM nodes and applies the differences to the dom
   *
   * @param {HTMLElement} $parent
   * @param {import('./vdom').VNode} oldNode
   * @param {import('./vdom').VNode} newNode
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

  class Controller {
    constructor($root, model, view, diffing = true) {
      this.$root = $root;
      this.model = model;
      this.view = view;
      this.diffing = diffing;
      this.vDom = null;
      this.init();
    }

    init() {
      this.vDom = this.view(this);
      this.$root.prepend(render(this.vDom));
    }

    refresh(state) {
      this.model = { ...this.model, ...state };
      let newVDom = this.view(this);
      if (this.diffing) {
        diff(this.$root, newVDom, this.vDom);
      } else {
        this.$root.replaceChild(render(newVDom), this.$root.firstChild);
      }
    }
  }

  class FormController extends Controller {
    constructor($root, model, view, diffing = true) {
      super($root, model, view, diffing);
      this.saveListeners = [];
    }

    addSaveListener(listener) {
      this.saveListeners.push(listener);
    }

    setVegetable(vegetable) {
      this.refresh({ ...vegetable });
    }

    setName(name) {
      this.refresh({name});
    }
    setClassification(classification) {
      this.refresh({classification});
    }
    setOrigin(origin) {
      this.refresh({origin});
    }
    setAmount(amount) {
      this.refresh({amount});
    }
    setComment(comment) {
      this.refresh({comment});
    }

    save() {
      this.saveListeners.forEach(listener => listener(this.model));
    }
  }

  const formModel = {
    id: 0,
    name: '',
    classification: 'Tubers',
    origin: '',
    amount: 1,
    comments: '',
  };
  const getInitialFormState = () => ({ ...formModel });

  class ListController extends Controller {
    constructor($root, model, view, diffing = true) {
      super($root, model, view, diffing);
      this.id = 0;
      this.selectionChangeListeners = [];
    }

    addSelectionChangeListener(listener) {
      this.selectionChangeListeners.push(listener);
    }

    nextId() {
      return ++this.id;
    }

    addVegetable(vegetable = getInitialFormState()) {
      const v = { ...vegetable, id: this.nextId() };
      this.refresh({
        vegetables: [...this.model.vegetables, v],
      });
      this.selectVegetable(v);
    }

    selectVegetable(vegetable) {
      this.refresh({ selected: vegetable });
      this.selectionChangeListeners.forEach(listener => listener(vegetable));
    }

    updateVegetable(vegetable) {
      const old = this.model.vegetables.find(v => v.id === vegetable.id);
      if (null == old) {
        this.addVegetable();
      } else {
        this.refresh({
          vegetables: this.model.vegetables.map(v => v.id === vegetable.id ? vegetable : v)
        });
      }
    }
  }

  const listModel = {
    selected: {},
    vegetables: []
  };
  const getInitialListState = () => ({ ...listModel });

  const formField = (label, element) => {
    return h('div', {}, [h('label', {}, label), element]);
  };

  const view = controller =>
    h('form', { submit: evt => {evt.preventDefault(); controller.save();} },
      h('fieldset', { disabled: controller.model.id <= 0 ? true : undefined },
        formField('name', h('input', {
            value: controller.model.name,
            change: evt => controller.setName(evt.target.value)
          })
        ),
        h('button', { type: 'submit' }, 'submit')
      )
    );

  const view$1 = controller =>
    h('div', {},
      h('button', { click: evt => controller.addVegetable() }, '+'),
      h('table', {},
        h('thead', {},
          h('tr', {},
            h('td', {}, 'Name'),
            h('td', {}, 'Classification'),
            h('td', {}, 'Origin'),
            h('td', {}, 'Amount'),
          )
        ),
        h('tbody', {}, controller.model.vegetables.map(v =>
          h('tr', {
            style: 'color:' + (v.id === controller.model.selected.id ? 'red' : 'black'),
            click: evt => controller.selectVegetable(v)
          },
            h('td', {}, v.name),
            h('td', {}, v.classification),
            h('td', {}, v.origin),
            h('td', {}, v.amount),
          ))
        )
      )
    );

  const $formRoot = document.getElementById('vegetable-input');
  const $listRoot = document.getElementById('vegetable-output');

  const formController = new FormController($formRoot, getInitialFormState(), view);
  const listController = new ListController($listRoot, getInitialListState(), view$1, false);

  formController.addSaveListener(vegetable => listController.updateVegetable(vegetable));
  listController.addSelectionChangeListener(vegetable => formController.setVegetable(vegetable));

}());
