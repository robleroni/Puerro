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
   *
   * https://github.com/developit/htm
   *
   * Copyright 2018 Google Inc. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *     http://www.apache.org/licenses/LICENSE-2.0
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const TAG_SET = 1;
  const PROPS_SET = 2;
  const PROPS_ASSIGN = 3;
  const CHILD_RECURSE = 4;
  const CHILD_APPEND = 0;

  const MODE_SLASH = 0;
  const MODE_TEXT = 1;
  const MODE_WHITESPACE = 2;
  const MODE_TAGNAME = 3;
  const MODE_ATTRIBUTE = 4;

  const evaluate = (h, current, fields, args) => {
    for (let i = 1; i < current.length; i++) {
      const field = current[i++];
      const value = typeof field === 'number' ? fields[field] : field;

      if (current[i] === TAG_SET) {
        args[0] = value;
      } else if (current[i] === PROPS_SET) {
        (args[1] = args[1] || {})[current[++i]] = value;
      } else if (current[i] === PROPS_ASSIGN) {
        args[1] = Object.assign(args[1] || {}, value);
      } else if (current[i]) {
        // code === CHILD_RECURSE
        args.push(h.apply(null, evaluate(h, value, fields, ['', null])));
      } else {
        // code === CHILD_APPEND
        args.push(value);
      }
    }

    return args;
  };

  const build = function(statics) {

    let mode = MODE_TEXT;
    let buffer = '';
    let quote = '';
    let current = [0];
    let char, propName;

    const commit = field => {
      if (mode === MODE_TEXT && (field || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))) {
        current.push(field || buffer, CHILD_APPEND);
      } else if (mode === MODE_TAGNAME && (field || buffer)) {
        current.push(field || buffer, TAG_SET);
        mode = MODE_WHITESPACE;
      } else if (mode === MODE_WHITESPACE && buffer === '...' && field) {
        current.push(field, PROPS_ASSIGN);
      } else if (mode === MODE_WHITESPACE && buffer && !field) {
        current.push(true, PROPS_SET, buffer);
      } else if (mode === MODE_ATTRIBUTE && propName) {
        current.push(field || buffer, PROPS_SET, propName);
        propName = '';
      }
      buffer = '';
    };

    for (let i = 0; i < statics.length; i++) {
      if (i) {
        if (mode === MODE_TEXT) {
          commit();
        }
        commit(i);
      }

      for (let j = 0; j < statics[i].length; j++) {
        char = statics[i][j];

        if (mode === MODE_TEXT) {
          if (char === '<') {
            // commit buffer
            commit();
            current = [current];
            mode = MODE_TAGNAME;
          } else {
            buffer += char;
          }
        } else if (quote) {
          if (char === quote) {
            quote = '';
          } else {
            buffer += char;
          }
        } else if (char === '"' || char === "'") {
          quote = char;
        } else if (char === '>') {
          commit();
          mode = MODE_TEXT;
        } else if (!mode) ; else if (char === '=') {
          mode = MODE_ATTRIBUTE;
          propName = buffer;
          buffer = '';
        } else if (char === '/') {
          commit();
          if (mode === MODE_TAGNAME) {
            current = current[0];
          }
          mode = current;
          (current = current[0]).push(mode, CHILD_RECURSE);
          mode = MODE_SLASH;
        } else if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
          // <a disabled>
          commit();
          mode = MODE_WHITESPACE;
        } else {
          buffer += char;
        }
      }
    }
    commit();

    return current;
  };

  const getCacheMap = statics => {
    let tpl = CACHE.get(statics);
    if (!tpl) {
      CACHE.set(statics, (tpl = build(statics)));
    }
    return tpl;
  };

  const getCacheKeyed = statics => {
    let key = '';
    for (let i = 0; i < statics.length; i++) {
      key += statics[i].length + '-' + statics[i];
    }
    return CACHE[key] || (CACHE[key] = build(statics));
  };

  const USE_MAP = typeof Map === 'function';
  const CACHE = USE_MAP ? new Map() : {};
  const getCache = USE_MAP ? getCacheMap : getCacheKeyed;

  const cached = function(statics) {
    const res = evaluate(this, getCache(statics), arguments, []);
    return res.length > 1 ? res : res[0];
  };

  const html = cached.bind(h);

  const $form = document.querySelector('form');
  const initialState = {
    from: new Date(),
    to: new Date(),
  };

  const onChange = setState => event => {
    if (new Date($form.from.value) >= new Date($form.to.value)) {
      $form.from.setCustomValidity('From-date has to be earlier than to-date!');
    } else {
      $form.from.setCustomValidity('');
      setState({ from: new Date($form.from.value), to: new Date($form.to.value) });
    }
  };

  const view = ({state, setState}) =>
    html`
    <div>
      <input
        input=${onChange(setState)}
        name="from"
        type="date"
        value=${state.from.toISOString().substr(0, 10)}
      required />
      <input
        input=${onChange(setState)}
        name="to"
        type="date"
        value=${state.to.toISOString().substr(0, 10)}
      required />
      <div>${state.from.toISOString()} - ${state.to.toISOString()}</div>
    </div>
  `;

  mount($form, view, initialState);

}());
