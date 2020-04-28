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

  /**
   * A Module to use for testing.
   *
   * @module test
   */

  /**
   * Adds a testGroup to the test report
   *
   * @param {String} name
   * @param {Function} callback
   */
  function describe(name, callback) {
    reportGroup(name);
    return callback(test);
  }

  /**
   * Adds and executes a test.
   *
   * @param {String} name
   * @param {Function} callback
   */
  function test(name, callback) {
    const assert = Assert();
    callback(assert);
    report(name, assert.getOk());
  }

  /**
   * Creates a new Assert object
   */
  function Assert() {
    const ok = [];

    const assert = (actual, expected, result)=> {
      if (!result) {
        console.log(`expected "${expected}" but was "${actual}"`);
        try {
          throw Error();
        } catch (err) {
          console.log(err);
        }
      }
      ok.push(result);
    };

    return {
      getOk: () => ok,
      is: (actual, expected) => assert(actual, expected, actual === expected),
      objectIs: (actual, expected) =>
        assert(actual, expected,
          Object.entries(actual).toString() === Object.entries(expected).toString()
        ),
      true: cond => ok.push(cond),
    };
  }

  /**
   * Creates group heading, to group tests together
   *
   * @param {string} name
   */
  function reportGroup(name) {
    const style = `
    font-weight: bold;
    margin-top: 10px;
  `;
    const $reportGroup = createDomElement('div', { style }, `Test ${name}`);
    document.body.appendChild($reportGroup);
  }


  /**
   * Reports an executed test to the DOM
   *
   * @param {string} origin
   * @param {Array<bool>} ok
   */
  function report(origin, ok) {
    const style = `
    color: ${ok.every(elem => elem) ? 'green' : 'red'};
    padding-left: 20px;
  `;
    const $report = createDomElement('div', { style },`
    ${ok.filter(elem => elem).length}/${ok.length} Tests in ${origin} ok.
  `);
    document.body.appendChild($report);
  }

  describe('DOM', test => {

    test('createDomElement with plain text', assert => {
      // given
      const tagName = 'div';
      const content = 'test123';

      // when
      const $el = createDomElement(tagName, {}, content);

      // then
      assert.is($el.innerText, content);
      assert.is($el.tagName.toLowerCase(), tagName);
    });

    test('createDomElement with child nodes', assert => {
      // given
      const tagName = 'ul';
      const content = `
      <li>test</li>
      <li>123</li>
    `;

      // when
      const $el = createDomElement(tagName, {}, content);

      //  then
      assert.is($el.childElementCount, 2);
    });

    test('createDomElement with attribute', assert => {
      // given
      const tagName = 'p';
      const content = 'test';
      const attributes = { style: 'color: green' };

      // when
      const $el = createDomElement(tagName, attributes, content);

      // then
      assert.is($el.getAttribute('style'), 'color: green');
    });
  });

  describe('Virtual DOM', test => {

    test('render', assert => {
      // given
      const vDOM = h('div', {}, h('h1', {id: 'puerro'}, 'Puerro'));

      // when
      const $dom = render(vDOM);

      // then
      assert.is($dom.innerHTML, '<h1 id="puerro">Puerro</h1>');
    });

    test('mount', assert => {
      // given
      const $root = document.createElement('main');
      const state = { counter: 1 };
      const view = ({state, setState}) => 
        h('div', {}, 
          h('button', { click: _ => setState({counter: state.counter+2 })}), 
          h('p', {}, state.counter));

      mount($root, view, state);

      // initial state
      assert.is($root.innerHTML, '<div><button></button><p>1</p></div>');

      // when
      $root.querySelector('button').click();

      // then
      assert.is($root.innerHTML, '<div><button></button><p>3</p></div>');
    });

    test('diffing - nodeChanged', assert => {
      // given
      let node1 = 1,
        node2 = 1;

      // when
      let result = changed(node1, node2);

      // then
      assert.is(result, false);

      // when
      node2 = 2;
      result = changed(node1, node2);

      // then
      assert.is(result, true);

      // when
      node2 = { tagName: 'p' };
      result = changed(node1, node2);

      // then
      assert.is(result, true);

      // when
      node1 = { tagName: 'p' };
      result = changed(node1, node2);

      // then
      assert.is(result, false);
    });

    test('diffing - attributesChanged', assert => {
      // given
      let node1 = { attributes: { test: 1 } };
      let node2 = { attributes: { test: 1 } };

      // when
      let result = changed(node1, node2);

      // then
      assert.is(result, false);

      // when
      node2.attributes.test = 2;
      result = changed(node1, node2);

      // then
      assert.is(result, true);

      // when
      delete node2.attributes.test;
      result = changed(node1, node2);

      // then
      assert.is(result, true);
    });
  });

}());
