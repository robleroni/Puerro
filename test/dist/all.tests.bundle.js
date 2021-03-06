(function () {
  'use strict';

  (function () {

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

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an object on which each property is observable
     * @param {any} object
     */
    const ObservableObject = object => {
      const listeners   = [];
      const subscribers = {};

      const notify = newObject => {
        if (object == newObject) return;
        const oldObject = object;
        object = newObject;

        Object.keys(newObject).forEach(key => {
          const newValue = newObject[key];
          const oldValue = oldObject[key];
          if (oldValue === newValue) return;
          (subscribers[key] || []).forEach(subscriber => subscriber(newValue, oldValue));
        });
        listeners.forEach(listener => listener(newObject, oldObject));
      };

      return {
        get:       ()              => object,
        set:       newObject       => notify({ ...object, ...newObject }),
        push:      (key, value)    => notify({ ...object, ...{ [key]: value } }),
        remove:    key             => notify({ ...object, ...{ [key]: undefined } }),
        replace:   newObject       => {
          const emptyObject = Object.assign({}, object);
          Object.keys(emptyObject).forEach(key => emptyObject[key] = undefined);
          notify({ ...emptyObject, ...newObject});
        },
        onChange:  callback        => { listeners.push(callback); callback(object, object); },
        subscribe: (key, callback) => {
          subscribers[key] = subscribers[key] || [];
          subscribers[key].push(callback);
          callback(object[key], object[key]);
        },
        // unsubscribe, removeOnChange
      };
    };

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Global store object
     */
    const store = ObservableObject({});

    /**
     * Abstract controller to use a MVC approach using the virtual DOM as a renderer.
     */
    class PuerroController {

      /**
       * Creating a new PuerroController
       * 
       * @param {HTMLElement} $root DOM element to mount view
       * @param {object} state initial state
       * @param {function(controller): VNode} view Virtual DOM creator
       * @param {boolean} diffing if diffing should be used
       */
      constructor($root, state, view, diffing = true) {
        this.$root = $root;
        this.state = ObservableObject({ ...state });
        this.view = view;
        this.diffing = diffing;
        this.vDom = null;
        this.init();
        this.onInit();
      }

      /**
       * Initial function of the Puerro Controller
       */
      init() {
        this.vDom = this.view(this);
        this.$root.prepend(render(this.vDom));
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * On Init Hook 
       */
      onInit() {}

      /**
       * Refreshs the view
       */
      refresh() {
        const newVDom = this.view(this);
        this.repaint(newVDom);
        this.vDom = newVDom;
      }

      /**
       * Repaint the virtual DOM using the DOM API
       * 
       * @param {VNode} newVDom vDom to be paintend
       */
      repaint(newVDom) {
        if (this.diffing) {
          diff(this.$root, newVDom, this.vDom);
        } else {
          this.$root.replaceChild(render(newVDom), this.$root.firstChild);
        }
      }

      /**
       * Returns the model (store and state)
       */
      get model() {
        return { ...store.get(), ...this.state.get() };
      }

      /**
       * Returns the store
       */
      get store() { return store; }

      /**
       * Static method for returning the store
       */
      static get store() { return store; }
    }

    var options = {};

    function extend(obj, props) {
      for (var i in props) {
        obj[i] = props[i];
      }return obj;
    }

    function applyRef(ref, value) {
      if (ref != null) {
        if (typeof ref == 'function') ref(value);else ref.current = value;
      }
    }

    var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

    var items = [];

    function enqueueRender(component) {
    	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
    		(defer)(rerender);
    	}
    }

    function rerender() {
    	var p;
    	while (p = items.pop()) {
    		if (p._dirty) renderComponent(p);
    	}
    }

    function isSameNodeType(node, vnode, hydrating) {
    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		return node.splitText !== undefined;
    	}
    	if (typeof vnode.nodeName === 'string') {
    		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
    	}
    	return hydrating || node._componentConstructor === vnode.nodeName;
    }

    function isNamedNode(node, nodeName) {
    	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }

    function getNodeProps(vnode) {
    	var props = extend({}, vnode.attributes);
    	props.children = vnode.children;

    	var defaultProps = vnode.nodeName.defaultProps;
    	if (defaultProps !== undefined) {
    		for (var i in defaultProps) {
    			if (props[i] === undefined) {
    				props[i] = defaultProps[i];
    			}
    		}
    	}

    	return props;
    }

    function createNode(nodeName, isSvg) {
    	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    	node.normalizedNodeName = nodeName;
    	return node;
    }

    function removeNode(node) {
    	var parentNode = node.parentNode;
    	if (parentNode) parentNode.removeChild(node);
    }

    function setAccessor(node, name, old, value, isSvg) {
    	if (name === 'className') name = 'class';

    	if (name === 'key') ; else if (name === 'ref') {
    		applyRef(old, null);
    		applyRef(value, node);
    	} else if (name === 'class' && !isSvg) {
    		node.className = value || '';
    	} else if (name === 'style') {
    		if (!value || typeof value === 'string' || typeof old === 'string') {
    			node.style.cssText = value || '';
    		}
    		if (value && typeof value === 'object') {
    			if (typeof old !== 'string') {
    				for (var i in old) {
    					if (!(i in value)) node.style[i] = '';
    				}
    			}
    			for (var i in value) {
    				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
    			}
    		}
    	} else if (name === 'dangerouslySetInnerHTML') {
    		if (value) node.innerHTML = value.__html || '';
    	} else if (name[0] == 'o' && name[1] == 'n') {
    		var useCapture = name !== (name = name.replace(/Capture$/, ''));
    		name = name.toLowerCase().substring(2);
    		if (value) {
    			if (!old) node.addEventListener(name, eventProxy, useCapture);
    		} else {
    			node.removeEventListener(name, eventProxy, useCapture);
    		}
    		(node._listeners || (node._listeners = {}))[name] = value;
    	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
    		try {
    			node[name] = value == null ? '' : value;
    		} catch (e) {}
    		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
    	} else {
    		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

    		if (value == null || value === false) {
    			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
    		} else if (typeof value !== 'function') {
    			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
    		}
    	}
    }

    function eventProxy(e) {
    	return this._listeners[e.type](e);
    }

    var mounts = [];

    var diffLevel = 0;

    var isSvgMode = false;

    var hydrating = false;

    function flushMounts() {
    	var c;
    	while (c = mounts.shift()) {
    		if (c.componentDidMount) c.componentDidMount();
    	}
    }

    function diff$1(dom, vnode, context, mountAll, parent, componentRoot) {
    	if (!diffLevel++) {
    		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

    		hydrating = dom != null && !('__preactattr_' in dom);
    	}

    	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

    	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

    	if (! --diffLevel) {
    		hydrating = false;

    		if (!componentRoot) flushMounts();
    	}

    	return ret;
    }

    function idiff(dom, vnode, context, mountAll, componentRoot) {
    	var out = dom,
    	    prevSvgMode = isSvgMode;

    	if (vnode == null || typeof vnode === 'boolean') vnode = '';

    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
    			if (dom.nodeValue != vnode) {
    				dom.nodeValue = vnode;
    			}
    		} else {
    			out = document.createTextNode(vnode);
    			if (dom) {
    				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
    				recollectNodeTree(dom, true);
    			}
    		}

    		out['__preactattr_'] = true;

    		return out;
    	}

    	var vnodeName = vnode.nodeName;
    	if (typeof vnodeName === 'function') {
    		return buildComponentFromVNode(dom, vnode, context, mountAll);
    	}

    	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

    	vnodeName = String(vnodeName);
    	if (!dom || !isNamedNode(dom, vnodeName)) {
    		out = createNode(vnodeName, isSvgMode);

    		if (dom) {
    			while (dom.firstChild) {
    				out.appendChild(dom.firstChild);
    			}
    			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

    			recollectNodeTree(dom, true);
    		}
    	}

    	var fc = out.firstChild,
    	    props = out['__preactattr_'],
    	    vchildren = vnode.children;

    	if (props == null) {
    		props = out['__preactattr_'] = {};
    		for (var a = out.attributes, i = a.length; i--;) {
    			props[a[i].name] = a[i].value;
    		}
    	}

    	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
    		if (fc.nodeValue != vchildren[0]) {
    			fc.nodeValue = vchildren[0];
    		}
    	} else if (vchildren && vchildren.length || fc != null) {
    			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
    		}

    	diffAttributes(out, vnode.attributes, props);

    	isSvgMode = prevSvgMode;

    	return out;
    }

    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
    	var originalChildren = dom.childNodes,
    	    children = [],
    	    keyed = {},
    	    keyedLen = 0,
    	    min = 0,
    	    len = originalChildren.length,
    	    childrenLen = 0,
    	    vlen = vchildren ? vchildren.length : 0,
    	    j,
    	    c,
    	    f,
    	    vchild,
    	    child;

    	if (len !== 0) {
    		for (var i = 0; i < len; i++) {
    			var _child = originalChildren[i],
    			    props = _child['__preactattr_'],
    			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
    			if (key != null) {
    				keyedLen++;
    				keyed[key] = _child;
    			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
    				children[childrenLen++] = _child;
    			}
    		}
    	}

    	if (vlen !== 0) {
    		for (var i = 0; i < vlen; i++) {
    			vchild = vchildren[i];
    			child = null;

    			var key = vchild.key;
    			if (key != null) {
    				if (keyedLen && keyed[key] !== undefined) {
    					child = keyed[key];
    					keyed[key] = undefined;
    					keyedLen--;
    				}
    			} else if (min < childrenLen) {
    					for (j = min; j < childrenLen; j++) {
    						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
    							child = c;
    							children[j] = undefined;
    							if (j === childrenLen - 1) childrenLen--;
    							if (j === min) min++;
    							break;
    						}
    					}
    				}

    			child = idiff(child, vchild, context, mountAll);

    			f = originalChildren[i];
    			if (child && child !== dom && child !== f) {
    				if (f == null) {
    					dom.appendChild(child);
    				} else if (child === f.nextSibling) {
    					removeNode(f);
    				} else {
    					dom.insertBefore(child, f);
    				}
    			}
    		}
    	}

    	if (keyedLen) {
    		for (var i in keyed) {
    			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
    		}
    	}

    	while (min <= childrenLen) {
    		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
    	}
    }

    function recollectNodeTree(node, unmountOnly) {
    	var component = node._component;
    	if (component) {
    		unmountComponent(component);
    	} else {
    		if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

    		if (unmountOnly === false || node['__preactattr_'] == null) {
    			removeNode(node);
    		}

    		removeChildren(node);
    	}
    }

    function removeChildren(node) {
    	node = node.lastChild;
    	while (node) {
    		var next = node.previousSibling;
    		recollectNodeTree(node, true);
    		node = next;
    	}
    }

    function diffAttributes(dom, attrs, old) {
    	var name;

    	for (name in old) {
    		if (!(attrs && attrs[name] != null) && old[name] != null) {
    			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
    		}
    	}

    	for (name in attrs) {
    		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
    			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    		}
    	}
    }

    var recyclerComponents = [];

    function createComponent(Ctor, props, context) {
    	var inst,
    	    i = recyclerComponents.length;

    	if (Ctor.prototype && Ctor.prototype.render) {
    		inst = new Ctor(props, context);
    		Component.call(inst, props, context);
    	} else {
    		inst = new Component(props, context);
    		inst.constructor = Ctor;
    		inst.render = doRender;
    	}

    	while (i--) {
    		if (recyclerComponents[i].constructor === Ctor) {
    			inst.nextBase = recyclerComponents[i].nextBase;
    			recyclerComponents.splice(i, 1);
    			return inst;
    		}
    	}

    	return inst;
    }

    function doRender(props, state, context) {
    	return this.constructor(props, context);
    }

    function setComponentProps(component, props, renderMode, context, mountAll) {
    	if (component._disable) return;
    	component._disable = true;

    	component.__ref = props.ref;
    	component.__key = props.key;
    	delete props.ref;
    	delete props.key;

    	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
    		if (!component.base || mountAll) {
    			if (component.componentWillMount) component.componentWillMount();
    		} else if (component.componentWillReceiveProps) {
    			component.componentWillReceiveProps(props, context);
    		}
    	}

    	if (context && context !== component.context) {
    		if (!component.prevContext) component.prevContext = component.context;
    		component.context = context;
    	}

    	if (!component.prevProps) component.prevProps = component.props;
    	component.props = props;

    	component._disable = false;

    	if (renderMode !== 0) {
    		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
    			renderComponent(component, 1, mountAll);
    		} else {
    			enqueueRender(component);
    		}
    	}

    	applyRef(component.__ref, component);
    }

    function renderComponent(component, renderMode, mountAll, isChild) {
    	if (component._disable) return;

    	var props = component.props,
    	    state = component.state,
    	    context = component.context,
    	    previousProps = component.prevProps || props,
    	    previousState = component.prevState || state,
    	    previousContext = component.prevContext || context,
    	    isUpdate = component.base,
    	    nextBase = component.nextBase,
    	    initialBase = isUpdate || nextBase,
    	    initialChildComponent = component._component,
    	    skip = false,
    	    snapshot = previousContext,
    	    rendered,
    	    inst,
    	    cbase;

    	if (component.constructor.getDerivedStateFromProps) {
    		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
    		component.state = state;
    	}

    	if (isUpdate) {
    		component.props = previousProps;
    		component.state = previousState;
    		component.context = previousContext;
    		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
    			skip = true;
    		} else if (component.componentWillUpdate) {
    			component.componentWillUpdate(props, state, context);
    		}
    		component.props = props;
    		component.state = state;
    		component.context = context;
    	}

    	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
    	component._dirty = false;

    	if (!skip) {
    		rendered = component.render(props, state, context);

    		if (component.getChildContext) {
    			context = extend(extend({}, context), component.getChildContext());
    		}

    		if (isUpdate && component.getSnapshotBeforeUpdate) {
    			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
    		}

    		var childComponent = rendered && rendered.nodeName,
    		    toUnmount,
    		    base;

    		if (typeof childComponent === 'function') {

    			var childProps = getNodeProps(rendered);
    			inst = initialChildComponent;

    			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
    				setComponentProps(inst, childProps, 1, context, false);
    			} else {
    				toUnmount = inst;

    				component._component = inst = createComponent(childComponent, childProps, context);
    				inst.nextBase = inst.nextBase || nextBase;
    				inst._parentComponent = component;
    				setComponentProps(inst, childProps, 0, context, false);
    				renderComponent(inst, 1, mountAll, true);
    			}

    			base = inst.base;
    		} else {
    			cbase = initialBase;

    			toUnmount = initialChildComponent;
    			if (toUnmount) {
    				cbase = component._component = null;
    			}

    			if (initialBase || renderMode === 1) {
    				if (cbase) cbase._component = null;
    				base = diff$1(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
    			}
    		}

    		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
    			var baseParent = initialBase.parentNode;
    			if (baseParent && base !== baseParent) {
    				baseParent.replaceChild(base, initialBase);

    				if (!toUnmount) {
    					initialBase._component = null;
    					recollectNodeTree(initialBase, false);
    				}
    			}
    		}

    		if (toUnmount) {
    			unmountComponent(toUnmount);
    		}

    		component.base = base;
    		if (base && !isChild) {
    			var componentRef = component,
    			    t = component;
    			while (t = t._parentComponent) {
    				(componentRef = t).base = base;
    			}
    			base._component = componentRef;
    			base._componentConstructor = componentRef.constructor;
    		}
    	}

    	if (!isUpdate || mountAll) {
    		mounts.push(component);
    	} else if (!skip) {

    		if (component.componentDidUpdate) {
    			component.componentDidUpdate(previousProps, previousState, snapshot);
    		}
    	}

    	while (component._renderCallbacks.length) {
    		component._renderCallbacks.pop().call(component);
    	}if (!diffLevel && !isChild) flushMounts();
    }

    function buildComponentFromVNode(dom, vnode, context, mountAll) {
    	var c = dom && dom._component,
    	    originalComponent = c,
    	    oldDom = dom,
    	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
    	    isOwner = isDirectOwner,
    	    props = getNodeProps(vnode);
    	while (c && !isOwner && (c = c._parentComponent)) {
    		isOwner = c.constructor === vnode.nodeName;
    	}

    	if (c && isOwner && (!mountAll || c._component)) {
    		setComponentProps(c, props, 3, context, mountAll);
    		dom = c.base;
    	} else {
    		if (originalComponent && !isDirectOwner) {
    			unmountComponent(originalComponent);
    			dom = oldDom = null;
    		}

    		c = createComponent(vnode.nodeName, props, context);
    		if (dom && !c.nextBase) {
    			c.nextBase = dom;

    			oldDom = null;
    		}
    		setComponentProps(c, props, 1, context, mountAll);
    		dom = c.base;

    		if (oldDom && dom !== oldDom) {
    			oldDom._component = null;
    			recollectNodeTree(oldDom, false);
    		}
    	}

    	return dom;
    }

    function unmountComponent(component) {

    	var base = component.base;

    	component._disable = true;

    	if (component.componentWillUnmount) component.componentWillUnmount();

    	component.base = null;

    	var inner = component._component;
    	if (inner) {
    		unmountComponent(inner);
    	} else if (base) {
    		if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

    		component.nextBase = base;

    		removeNode(base);
    		recyclerComponents.push(component);

    		removeChildren(base);
    	}

    	applyRef(component.__ref, null);
    }

    function Component(props, context) {
    	this._dirty = true;

    	this.context = context;

    	this.props = props;

    	this.state = this.state || {};

    	this._renderCallbacks = [];
    }

    extend(Component.prototype, {
    	setState: function setState(state, callback) {
    		if (!this.prevState) this.prevState = this.state;
    		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
    		if (callback) this._renderCallbacks.push(callback);
    		enqueueRender(this);
    	},
    	forceUpdate: function forceUpdate(callback) {
    		if (callback) this._renderCallbacks.push(callback);
    		renderComponent(this, 2);
    	},
    	render: function render() {}
    });

    function render$1(vnode, parent, merge) {
      return diff$1(merge, vnode, {}, false, parent, false);
    }

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Controller to use a MVC approach using the virtual DOM renderer of [preact](http://preactjs.com).
     */
    class PreactController extends PuerroController {
      
      /**
       * Initial function of the Preact Controller
       */
      init() {
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * Painting virtual DOM with the preact renderer.
       * 
       * @param {VNode} newVdom vDom to be paintend
       */
      repaint(newVdom) {
        render$1(newVdom, this.$root, this.$root.firstChild);
      }
    }

    describe('MVC Controller with virtual DOM', test => {
      test('Puerro Controller', assert => {
        // before
        class MyController extends PuerroController {
          increment() {
            this.state.push('counter', this.model.counter + 1);
          }
        }

        // given
        const $div = document.createElement('div');                      // DOM
        const model = { counter: 0 };                                    // model
        const view = controller => h('p', {}, controller.model.counter); // view
        const controller = new MyController($div, model, view);          // controller

        // inital state
        assert.is(controller.model.counter, 0);
        assert.is($div.firstChild.textContent, '0');

        // when
        controller.increment();

        // then
        assert.is(controller.model.counter, 1);
        assert.is($div.firstChild.textContent, '1');
      });

      test('Preact Controller', assert => {
        // before
        class MyController extends PreactController {
          increment() {
            this.state.push('counter', this.model.counter + 1);
          }
        }

        // given
        const $div = document.createElement('div');                      // DOM
        const model = { counter: 0 };                                    // model
        const view = controller => h('p', {}, controller.model.counter); // view
        const controller = new MyController($div, model, view);          // controller

        // inital state
        assert.is(controller.model.counter, 0);
        assert.is($div.firstChild.textContent, '0');

        // when
        controller.increment();

        // then
        assert.is(controller.model.counter, 1);
        assert.is($div.firstChild.textContent, '1');
      });
    });

  }());

  (function () {

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

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an Observable
     * @param {any} item
     */
    const Observable = item => {
      const listeners = [];
      return {
        get: () => item,
        set: newItem => {
          if (item === newItem) return;
          const oldItem = item;
          item = newItem;
          listeners.forEach(notify => notify(newItem, oldItem));
        },
        onChange: callback => {
          listeners.push(callback);
          callback(item, item);
        },
      };
    };

    /**
     * Creates an object on which each property is observable
     * @param {any} object
     */
    const ObservableObject = object => {
      const listeners   = [];
      const subscribers = {};

      const notify = newObject => {
        if (object == newObject) return;
        const oldObject = object;
        object = newObject;

        Object.keys(newObject).forEach(key => {
          const newValue = newObject[key];
          const oldValue = oldObject[key];
          if (oldValue === newValue) return;
          (subscribers[key] || []).forEach(subscriber => subscriber(newValue, oldValue));
        });
        listeners.forEach(listener => listener(newObject, oldObject));
      };

      return {
        get:       ()              => object,
        set:       newObject       => notify({ ...object, ...newObject }),
        push:      (key, value)    => notify({ ...object, ...{ [key]: value } }),
        remove:    key             => notify({ ...object, ...{ [key]: undefined } }),
        replace:   newObject       => {
          const emptyObject = Object.assign({}, object);
          Object.keys(emptyObject).forEach(key => emptyObject[key] = undefined);
          notify({ ...emptyObject, ...newObject});
        },
        onChange:  callback        => { listeners.push(callback); callback(object, object); },
        subscribe: (key, callback) => {
          subscribers[key] = subscribers[key] || [];
          subscribers[key].push(callback);
          callback(object[key], object[key]);
        },
        // unsubscribe, removeOnChange
      };
    };

    /**
     * Creates an Observable list
     * @param {any[]} list
     */
    const ObservableList = list => {
      const addListeners     = [];
      const removeListeners  = [];
      const replaceListeners = [];
      return {
        onAdd:     listener => addListeners    .push(listener),
        onRemove:  listener => removeListeners .push(listener),
        onReplace: listener => replaceListeners.push(listener),
        add: item => {
          list.push(item);
          addListeners.forEach(listener => listener(item));
        },
        remove: item => {
          const i = list.indexOf(item);
          if (i >= 0) {
            list.splice(i, 1);
          } // essentially "remove(item)"
          removeListeners.forEach(listener => listener(item));
        },
        replace: (item, newItem) => {
          const i = list.indexOf(item);
          if (i >= 0) {
            list[i] = newItem;
          }
          replaceListeners.forEach(listener => listener(newItem, item));
        },
        count:   ()    => list.length,
        countIf: pred  => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
        indexOf: item  => list.indexOf(item),
        get:     index => list[index],
        getAll:  ()    => list,
      };
    };

    describe('Observables', test => {
      test('Observable Value', assert => {
        // given
        const observable1 = Observable('');
        const observable2 = Observable('');

        let newValue1, oldValue1, newValue2, oldValue2;
        observable1.onChange((newVal, oldVal) => { newValue1 = newVal; oldValue1 = oldVal; });
        observable2.onChange((newVal, oldVal) => { newValue2 = newVal; oldValue2 = oldVal; });
        
        // initial state
        assert.is(observable1.get(), '');

        // when  
        observable1.set('Puerro');

        // then 
        assert.is(newValue1,         'Puerro'); // subscribers got notified  
        assert.is(oldValue1,         '');       // subscribers got notified  
        assert.is(observable1.get(), 'Puerro'); // value has updated

        // when the receiver symbol changes
        const newRef = observable1;
        newRef.set('Huerto');

        // then listener still updates correctly
        assert.is(newValue1,         'Huerto'); // subscribers got notified  
        assert.is(oldValue1,         'Puerro'); // subscribers got notified  
        assert.is(observable1.get(), 'Huerto'); // value has updated

        // when
        observable2.set('Puerro');

        // then subscribers get notified
        assert.is(newValue1,         'Huerto');
        assert.is(newValue2,         'Puerro');
        assert.is(oldValue1,         'Puerro');
        assert.is(oldValue2,         '');
        assert.is(observable2.get(), 'Puerro'); //  value is updated
      });

      test('Observable List', assert => {
        // given
        const raw = [];
        const list = ObservableList(raw); // decorator pattern

        let addCount = 0, removeCount = 0;
        list.onAdd   (item => (addCount    += item));
        list.onRemove(item => (removeCount += item));

        // initial
        assert.is(list.count(), 0);
        assert.is(raw.length,   0);

        // when
        list.add(1);

        // then
        const index = list.indexOf(1);
        assert.is(addCount,        1);
        assert.is(list.count(),    1);
        assert.is(raw.length,      1);
        assert.is(index,           0);
        assert.is(list.get(index), 1);

        // when
        list.remove(1);

        // then
        assert.is(removeCount,  1);
        assert.is(list.count(), 0);
        assert.is(raw.length,   0);
      });

      test('Observable Object', assert => {
        // given
        const object = ObservableObject({}); // decorator pattern

        let newObject, oldObject, newValue, oldValue;
        object.onChange (         (newObj, oldObj) => { newObject = newObj; oldObject = oldObj; });
        object.subscribe('value', (newVal, oldVal) => { newValue  = newVal; oldValue  = oldVal; });
        
        // initial
        assert.objectIs(object.get(), {});
        assert.objectIs(oldObject,    {});
        assert.objectIs(newObject,    {});
        assert.is      (oldValue,     undefined);
        assert.is      (newValue,     undefined);

        // when
        object.set({ value: 1 });

        // then
        assert.objectIs(oldObject,    {});
        assert.objectIs(newObject,    { value: 1 });
        assert.is      (oldValue,     undefined);
        assert.is      (newValue,     1);

        // when
        object.push('text', 'Puerro');

        // then
        assert.objectIs(oldObject,    { value: 1 });
        assert.objectIs(newObject,    { value: 1, text: 'Puerro' });
        assert.is      (oldValue,     undefined);
        assert.is      (newValue,     1);

        // when
        object.replace({ text: 'Huerto' });

        // then
        assert.objectIs(oldObject,    { value: 1,         text: 'Puerro' });
        assert.objectIs(newObject,    { value: undefined, text: 'Huerto' });
        assert.is      (oldValue,     1);
        assert.is      (newValue,     undefined);

        // when
        object.set({ value: 2 });

        // then
        assert.objectIs(oldObject,    { value: undefined, text: 'Huerto' });
        assert.objectIs(newObject,    { value: 2,         text: 'Huerto' });
        assert.is      (oldValue,     undefined);
        assert.is      (newValue,     2);

        // when
        object.set({ value: 1 });

        // then
        assert.objectIs(oldObject,    { value: 2, text: 'Huerto' });
        assert.objectIs(newObject,    { value: 1, text: 'Huerto' });
        assert.is      (oldValue,     2);
        assert.is      (newValue,     1);

        // when
        object.remove('value');

        // then
        assert.objectIs(object.get(), newObject);
        assert.objectIs(oldObject,    { value: 1,         text: 'Huerto' });
        assert.objectIs(newObject,    { value: undefined, text: 'Huerto' });
        assert.is      (oldValue,     1);
        assert.is      (newValue,     undefined);
      });
    });

  }());

  (function () {

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

  (function () {

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

    /**
     * Abstract class which provides state to custom HTML elements.
     */
    class PuerroElement extends HTMLElement {
      /**
       * Creates a new Puerro Element
       * 
       * @param {Object} initialState initial state
       */
      constructor(initialState = {}) {
        super();
        this.state = initialState;
      }

      /**
       * Connected Callback
       */
      connectedCallback() {
        this.refresh();
      }

      /**
       * Sets a new state based on a given object or function
       *
       * @param {object | Function} newState
       */
      setState(newState) {
        if (typeof newState === 'function') {
          this.state = { ...this.state, ...newState(state) };
        } else {
          this.state = { ...this.state, ...newState };
        }
        this.refresh();
      }

      /**
       * Refreshes the Dom
       */
      refresh() {
        const newVNode = this.render();
        if (null == this.vNode) {
          this.prepend(render(this.render()));
        } else {
          diff(this, newVNode, this.vNode);
        }
        this.vNode = newVNode;
      }

      /**
       * Render function
       * @abstract
       */
      render() { }
    }

    describe('Web Components', test => {

      // before
      class MyComponent extends PuerroElement {
        static get Selector() { return 'my-component' };

        _change() {
          this.innerText = 'Changed';
        }

        render() {
          return h('button', {
            type: 'button',
            click: this._change
          }, 'Act')
        }
      }

      window.customElements.define(MyComponent.Selector, MyComponent);

      test('render component', assert => {
        // given
        const $myComponent = createDomElement('my-component');

        // when
        $myComponent.refresh();

        // then
        assert.is($myComponent.innerHTML, '<button type="button">Act</button>');
      });

      test('interact with component', assert => {
        // given
        const $myComponent = createDomElement('my-component');

        // when
        $myComponent.refresh();
        $myComponent.querySelector('button').click();

        // then
        assert.is($myComponent.innerHTML, '<button type="button">Changed</button>');
      });

    });

  }());

  // Generated file

  (function () {

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

    const sum = (a, b) => a + b;

    describe('Research - 01 - Testability', test => {
      test('adding numbers', assert => {
        // given
        const a = 1;
        const b = 2;

        // when
        const result = sum(a, b);

        // then
        assert.is(result, 3);
      });
    });

  }());

  (function () {

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

    const ENTER_KEYCODE = 13;

    /**
     * Registers the event for adding a vegetable
     *
     * @param {HTMLInputElement} $vegetableInput - Input element to add new vegetables
     * @param {HTMLElement} $vegetablesOutput    - Container for the vegetables
     */
    function registerAddingVegetableEvent($vegetableInput, $vegetablesOutput) {
      $vegetableInput.addEventListener('keydown', event => {
        if (event.keyCode === ENTER_KEYCODE) {
          const $vegetable = document.createElement('li');
          $vegetable.textContent = $vegetableInput.value;
          $vegetablesOutput.appendChild($vegetable);
          $vegetableInput.value = '';
        }
      });
    }

    describe('Huerto - 01', test => {
      test('add Vegetable', assert => {
        // given
        const $vegetableInput = document.createElement('input');
        const $vegetables     = document.createElement('ul');
        registerAddingVegetableEvent($vegetableInput, $vegetables);

        // when
        $vegetableInput.value = 'leek';
        $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

        // then
        assert.is($vegetables.children.length, 1);
        assert.is($vegetables.innerHTML, '<li>leek</li>');
        assert.is($vegetableInput.value, '');

        // when
        $vegetableInput.value = 'tomato';
        $vegetableInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE }));

        // then
        assert.is($vegetables.children.length, 2);
        assert.is($vegetables.innerHTML, '<li>leek</li><li>tomato</li>');
        assert.is($vegetableInput.value, '');
      });
    });

  }());

  (function () {

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

    /**
     * Event handler for subbmiting the form.
     * It appends the Vegetable Output String to the given list.
     *
     * @param {HTMLUListElement} $list
     * @returns {function(Event): void}
     */
    const onFormSubmit = $list => event => {
      event.preventDefault(); // Prevent Form Submission
      $list.appendChild(createDomElement('li', {}, createVegetableOutputString(event.target)));
    };

    /**
     * Event Handler for the amount input.
     * It changes the display style based on the planted checkbox
     *
     * @param {HTMLInputElement} $amount
     * @returns {function(Event): void}
     */
    const onPlantedChecked = $amount => event => {
      $amount.style.display = event.target.checked ? 'inline' : 'none';
    };

    /**
     * Renders the Vegetable Classifications
     *
     * @param {HTMLSelectElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(createDomElement('option', {}, c)));
    };

    /**
     * Creates the vegetable output string
     *
     * @param {HTMLFormElement} $form
     */
    const createVegetableOutputString = $form =>
      `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

    describe('Huerto - 02', test => {

      test('adding vegetable', assert => {
        // given
        const form = {
          name:           { value:   'leek' },
          classification: { value:   'fruit' },
          origin:         { value:   'Europe' },
          planted:        { checked: true },
          amount:         { value:   '4' },
          comments:       { value:   'needs water daily' },
        };

        const $list = document.createElement('ul');

        // when
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 1);
        assert.is(
          $list.children[0].textContent,
          'leek (fruit) from Europe, planted (4), needs water daily'
        );

        // when
        form.name.value = 'tomato';
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 2);
        assert.is(
          $list.children[1].textContent,
          'tomato (fruit) from Europe, planted (4), needs water daily'
        );
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount   = document.createElement('input');

        // when
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'none');

        // when
        $checkbox.checked = true;
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'inline');
      });

      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 10);
      });
    });

  }());

  (function () {

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

    /**
     * Event handler for subbmiting the form.
     * It appends the Vegetable Output String to the given list.
     *
     * @param {HTMLUListElement} $list
     * @returns {function(Event): void}
     */
    const onFormSubmit = $list => event => {
      event.preventDefault(); // Prevent Form Submission
      $list.appendChild(createDomElement('li', {}, vegetableOutputString(event.target)));
      event.target.name.classList.remove('invalid');
    };

    /**
     * Event Handler for the amount input.
     * It changes the display style based on the planted checkbox
     *
     * @param {HTMLInputElement} $amount
     * @returns {function(Event): void}
     */
    const onPlantedChecked = $amount => event => {
      $amount.style.display = event.target.checked ? 'inline' : 'none';
    };

    /**
     * Event Handler for the classification dependent validation
     * 
     * @param {HTMLInputElement} $origin
     */
    const onClassification = $origin => value => event => {
      $origin.disabled = false;
      $origin.labels.forEach(label => (label.style.opacity = '1'));

      if (event.target.value === value) {
        $origin.disabled = true;
        $origin.checked = false;
        $origin.labels.forEach(label => (label.style.opacity = '0.5'));
      }
    };

    /**
     * Renders the Vegetable Classifications
     *
     * @param {HTMLSelectElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(createDomElement('option', {}, c)));
    };


    /**
     * Creates the vegetable output string
     *
     * @param {HTMLFormElement} $form
     */
    const vegetableOutputString = $form =>
      `${$form.name.value} (${$form.classification.value}) from ${$form.origin.value}, ${
    $form.planted.checked ? `planted (${$form.amount.value})` : 'not planted'
  }, ${$form.comments.value}`;

    describe('Huerto - 03', test => {

      test('adding vegetable', assert => {
        // given
        const form = {
          name:           createDomElement('input', { value:   'leek' }), // creating DOM Element for validation purposes
          classification: { value:   'fruit' },
          origin:         { value:   'Europe' },
          planted:        { checked: true },
          amount:         { value:   '4' },
          comments:       { value:   'needs water daily' },
        };

        const $list = document.createElement('ul');

        // when
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 1);
        assert.is(
          $list.children[0].textContent,
          'leek (fruit) from Europe, planted (4), needs water daily'
        );

        // when
        form.name.value = 'tomato';
        onFormSubmit($list)({ preventDefault: () => undefined, target: form });

        // then
        assert.is($list.children.length, 2);
        assert.is(
          $list.children[1].textContent,
          'tomato (fruit) from Europe, planted (4), needs water daily'
        );
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount   = document.createElement('input');

        // when
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'none');

        // when
        $checkbox.checked = true;
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'inline');
      });

      test('onClassification', assert => {
        // given
        const classification = {};
        const $origin = document.createElement('input');

        // when
        classification.value = 'Fungi';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, true);
        assert.is($origin.checked, false);

        // when
        classification.value = 'Fruits';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, false);
      });

      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 10);
      });
    });

  }());

  (function () {

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

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an Observable
     * @param {any} item
     */
    const Observable = item => {
      const listeners = [];
      return {
        get: () => item,
        set: newItem => {
          if (item === newItem) return;
          const oldItem = item;
          item = newItem;
          listeners.forEach(notify => notify(newItem, oldItem));
        },
        onChange: callback => {
          listeners.push(callback);
          callback(item, item);
        },
      };
    };

    /**
     * Creates an Observable list
     * @param {any[]} list
     */
    const ObservableList = list => {
      const addListeners     = [];
      const removeListeners  = [];
      const replaceListeners = [];
      return {
        onAdd:     listener => addListeners    .push(listener),
        onRemove:  listener => removeListeners .push(listener),
        onReplace: listener => replaceListeners.push(listener),
        add: item => {
          list.push(item);
          addListeners.forEach(listener => listener(item));
        },
        remove: item => {
          const i = list.indexOf(item);
          if (i >= 0) {
            list.splice(i, 1);
          } // essentially "remove(item)"
          removeListeners.forEach(listener => listener(item));
        },
        replace: (item, newItem) => {
          const i = list.indexOf(item);
          if (i >= 0) {
            list[i] = newItem;
          }
          replaceListeners.forEach(listener => listener(newItem, item));
        },
        count:   ()    => list.length,
        countIf: pred  => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
        indexOf: item  => list.indexOf(item),
        get:     index => list[index],
        getAll:  ()    => list,
      };
    };

    const id = idGenerator();
    function* idGenerator() {
      let id = 0;
      while (true) yield ++id;
    }

    const Vegetable = () => {
      const _id = Observable(id.next().value);
      const _name = Observable('Vegi');
      const _classification = Observable('');
      const _origin = Observable('Europe');
      const _plantend = Observable(true);
      const _amount = Observable(1);
      const _comments = Observable('');

      return {
        getId: () => _id.get(),
        getName: () => _name.get(),
        getClassification: () => _classification.get(),
        getOrigin: () => _origin.get(),
        getPlanted: () => _plantend.get(),
        getAmount: () => _amount.get(),
        getComments: () => _comments.get(),
        setId: id => _id.set(id),
        setName: name => _name.set(name),
        setClassification: classification => _classification.set(classification),
        setOrigin: origin => _origin.set(origin),
        setPlanted: plantend => _plantend.set(plantend),
        setAmount: amount => _amount.set(amount),
        setComments: comments => _comments.set(comments),
      };
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

    const vegetables = ObservableList([]);
    const selectedVegetable = Observable(null);

    /**
     * Adds a vegetable to given table
     *
     * @param {HTMLTableElement} $table
     */
    const addVegetable = $table => vegetable => {
      $table.appendChild(render(trEntry(vegetable)));
      selectedVegetable.set(vegetable);
    };

    /**
     * Deletes a vegetable in the given table
     *
     * @param {HTMLTableElement} $table
     */
    const deleteVegetable = $table => vegetable => {
      if (null == vegetable) return;

      const $trs = $table.querySelectorAll('tr:not(:first-child)');
      const $tr = [...$trs].find($tr => $tr.getAttribute('data-id') == vegetable.getId());

      if ($tr.previousSibling) {
        selectedVegetable.set(
          vegetables.getAll().find(v => v.getId() == $tr.previousSibling.getAttribute('data-id'))
        );
      }

      if ($tr.nextSibling) {
        selectedVegetable.set(
          vegetables.getAll().find(v => v.getId() == $tr.nextSibling.getAttribute('data-id'))
        );
      }

      $table.removeChild($tr);
    };

    /**
     * Handles row click event
     *
     * @param {Event} event
     */
    const onVegetableRowClick = event => {
      const $table = event.target.parentElement;
      const vegetable = vegetables.getAll().find(v => v.getId() == $table.getAttribute('data-id'));
      selectedVegetable.set(vegetable);
    };

    /**
     * Handles planted click
     *
     * @param {HTMLElement} $amount
     */
    const onPlantedChecked = $amount => event => {
      $amount.style.display = event.target.checked ? 'inline' : 'none';
    };

    /**
     * Handles classification changes
     *
     * @param {HTMLElement} $origin
     */
    const onClassification = $origin => value => event => {
      $origin.disabled = false;
      $origin.labels.forEach(label => (label.style.opacity = '1'));

      if (event.target.value === value) {
        $origin.disabled = true;
        $origin.checked = false;
        $origin.labels.forEach(label => (label.style.opacity = '0.5'));
      }
    };

    /**
     * Creates a virtual TR with the vegetable data of the given vegetable
     *
     * @param {import('./vegetable').Vegetable} vegetable
     */
    const trEntry = vegetable => {
      return h('tr', { 'data-id': vegetable.getId(), click: onVegetableRowClick }, [
        h('td', {}, vegetable.getName()),
        h('td', {}, vegetable.getClassification()),
        h('td', {}, vegetable.getOrigin()),
        h('td', { style: `opacity: ${vegetable.getPlanted() ? 1 : 0.3}` }, vegetable.getAmount()),
        h('td', {}, vegetable.getComments()),
      ]);
    };

    /**
     * Renders the vegetable classifications
     * @param {HTMLElement} $select
     */
    const renderVegetableClassifications = $select => {
      vegetableClassifications.forEach(c => $select.append(render(h('option', {}, c))));
    };

    describe('Huerto - 04', test => {
      test('renderVegetableClassifications', assert => {
        // given
        const $select = document.createElement('select');

        // when
        renderVegetableClassifications($select);

        // then
        assert.is($select.children.length, 10);
      });

      test('onFormSubmit', assert => {
        // given
        /*const form = {
          name: createDomElement('input', { value: 'tomato' }),
          classification: { value: 'fruit' },
          origin: { value: 'Europe' },
          planted: { checked: true },
          amount: { value: '4' },
          comments: { value: 'needs water daily' },
        };*/

        // before
        assert.is(vegetables.count(), 0);

        // when
        vegetables.add(Vegetable());

        // then
        assert.is(vegetables.count(), 1);
      });

      test('onPlantedChecked', assert => {
        // given
        const $checkbox = document.createElement('input');
        const $amount = document.createElement('input');

        // when
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'none');

        // when
        $checkbox.checked = true;
        onPlantedChecked($amount)({ target: $checkbox });

        // then
        assert.is($amount.style.display, 'inline');
      });

      test('onClassification', assert => {
        // given
        const classification = {};
        const $origin = document.createElement('input');

        // when
        classification.value = 'Fungi';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, true);
        assert.is($origin.checked, false);

        // when
        classification.value = 'Fruits';
        onClassification($origin)('Fungi')({ target: classification });

        // then
        assert.is($origin.disabled, false);
      });

      test('add Vegetable', assert => {
        // given
        const $table = createDomElement('table');
        $table.appendChild(createDomElement('tr')); // adding header

        const vegetable = Vegetable();
        vegetable.setName('Tomato');

        // when
        addVegetable($table)(vegetable);

        // then
        const $tr = $table.querySelector('tr:not(:first-child)');
        assert.is($table.children.length, 2);
        assert.true($tr.textContent.includes('Tomato'));
      });

      test('delete Vegetable', assert => {
        // given
        const $table = createDomElement('table');
        $table.appendChild(createDomElement('tr')); // adding header

        const vegetable = Vegetable();
        vegetable.setName('Tomato');
        vegetables.add(vegetable);

        //when
        addVegetable($table)(vegetable);

        // then
        const $tr = $table.querySelector('tr:not(:first-child)');
        assert.is($table.children.length, 2);
        assert.true($tr.textContent.includes('Tomato'));

        // when
        deleteVegetable($table)(vegetable);

        // then
        assert.is($table.children.length, 1);
      });
    });

  }());

  (function () {

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

    var VNode = function VNode() {};

    var options = {};

    var stack = [];

    var EMPTY_CHILDREN = [];

    function h(nodeName, attributes) {
    	var children = EMPTY_CHILDREN,
    	    lastSimple,
    	    child,
    	    simple,
    	    i;
    	for (i = arguments.length; i-- > 2;) {
    		stack.push(arguments[i]);
    	}
    	if (attributes && attributes.children != null) {
    		if (!stack.length) stack.push(attributes.children);
    		delete attributes.children;
    	}
    	while (stack.length) {
    		if ((child = stack.pop()) && child.pop !== undefined) {
    			for (i = child.length; i--;) {
    				stack.push(child[i]);
    			}
    		} else {
    			if (typeof child === 'boolean') child = null;

    			if (simple = typeof nodeName !== 'function') {
    				if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
    			}

    			if (simple && lastSimple) {
    				children[children.length - 1] += child;
    			} else if (children === EMPTY_CHILDREN) {
    				children = [child];
    			} else {
    				children.push(child);
    			}

    			lastSimple = simple;
    		}
    	}

    	var p = new VNode();
    	p.nodeName = nodeName;
    	p.children = children;
    	p.attributes = attributes == null ? undefined : attributes;
    	p.key = attributes == null ? undefined : attributes.key;

    	return p;
    }

    function extend(obj, props) {
      for (var i in props) {
        obj[i] = props[i];
      }return obj;
    }

    function applyRef(ref, value) {
      if (ref != null) {
        if (typeof ref == 'function') ref(value);else ref.current = value;
      }
    }

    var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

    var items = [];

    function enqueueRender(component) {
    	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
    		(defer)(rerender);
    	}
    }

    function rerender() {
    	var p;
    	while (p = items.pop()) {
    		if (p._dirty) renderComponent(p);
    	}
    }

    function isSameNodeType(node, vnode, hydrating) {
    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		return node.splitText !== undefined;
    	}
    	if (typeof vnode.nodeName === 'string') {
    		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
    	}
    	return hydrating || node._componentConstructor === vnode.nodeName;
    }

    function isNamedNode(node, nodeName) {
    	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }

    function getNodeProps(vnode) {
    	var props = extend({}, vnode.attributes);
    	props.children = vnode.children;

    	var defaultProps = vnode.nodeName.defaultProps;
    	if (defaultProps !== undefined) {
    		for (var i in defaultProps) {
    			if (props[i] === undefined) {
    				props[i] = defaultProps[i];
    			}
    		}
    	}

    	return props;
    }

    function createNode(nodeName, isSvg) {
    	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    	node.normalizedNodeName = nodeName;
    	return node;
    }

    function removeNode(node) {
    	var parentNode = node.parentNode;
    	if (parentNode) parentNode.removeChild(node);
    }

    function setAccessor(node, name, old, value, isSvg) {
    	if (name === 'className') name = 'class';

    	if (name === 'key') ; else if (name === 'ref') {
    		applyRef(old, null);
    		applyRef(value, node);
    	} else if (name === 'class' && !isSvg) {
    		node.className = value || '';
    	} else if (name === 'style') {
    		if (!value || typeof value === 'string' || typeof old === 'string') {
    			node.style.cssText = value || '';
    		}
    		if (value && typeof value === 'object') {
    			if (typeof old !== 'string') {
    				for (var i in old) {
    					if (!(i in value)) node.style[i] = '';
    				}
    			}
    			for (var i in value) {
    				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
    			}
    		}
    	} else if (name === 'dangerouslySetInnerHTML') {
    		if (value) node.innerHTML = value.__html || '';
    	} else if (name[0] == 'o' && name[1] == 'n') {
    		var useCapture = name !== (name = name.replace(/Capture$/, ''));
    		name = name.toLowerCase().substring(2);
    		if (value) {
    			if (!old) node.addEventListener(name, eventProxy, useCapture);
    		} else {
    			node.removeEventListener(name, eventProxy, useCapture);
    		}
    		(node._listeners || (node._listeners = {}))[name] = value;
    	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
    		try {
    			node[name] = value == null ? '' : value;
    		} catch (e) {}
    		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
    	} else {
    		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

    		if (value == null || value === false) {
    			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
    		} else if (typeof value !== 'function') {
    			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
    		}
    	}
    }

    function eventProxy(e) {
    	return this._listeners[e.type](e);
    }

    var mounts = [];

    var diffLevel = 0;

    var isSvgMode = false;

    var hydrating = false;

    function flushMounts() {
    	var c;
    	while (c = mounts.shift()) {
    		if (c.componentDidMount) c.componentDidMount();
    	}
    }

    function diff$1(dom, vnode, context, mountAll, parent, componentRoot) {
    	if (!diffLevel++) {
    		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

    		hydrating = dom != null && !('__preactattr_' in dom);
    	}

    	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

    	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

    	if (! --diffLevel) {
    		hydrating = false;

    		if (!componentRoot) flushMounts();
    	}

    	return ret;
    }

    function idiff(dom, vnode, context, mountAll, componentRoot) {
    	var out = dom,
    	    prevSvgMode = isSvgMode;

    	if (vnode == null || typeof vnode === 'boolean') vnode = '';

    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
    			if (dom.nodeValue != vnode) {
    				dom.nodeValue = vnode;
    			}
    		} else {
    			out = document.createTextNode(vnode);
    			if (dom) {
    				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
    				recollectNodeTree(dom, true);
    			}
    		}

    		out['__preactattr_'] = true;

    		return out;
    	}

    	var vnodeName = vnode.nodeName;
    	if (typeof vnodeName === 'function') {
    		return buildComponentFromVNode(dom, vnode, context, mountAll);
    	}

    	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

    	vnodeName = String(vnodeName);
    	if (!dom || !isNamedNode(dom, vnodeName)) {
    		out = createNode(vnodeName, isSvgMode);

    		if (dom) {
    			while (dom.firstChild) {
    				out.appendChild(dom.firstChild);
    			}
    			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

    			recollectNodeTree(dom, true);
    		}
    	}

    	var fc = out.firstChild,
    	    props = out['__preactattr_'],
    	    vchildren = vnode.children;

    	if (props == null) {
    		props = out['__preactattr_'] = {};
    		for (var a = out.attributes, i = a.length; i--;) {
    			props[a[i].name] = a[i].value;
    		}
    	}

    	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
    		if (fc.nodeValue != vchildren[0]) {
    			fc.nodeValue = vchildren[0];
    		}
    	} else if (vchildren && vchildren.length || fc != null) {
    			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
    		}

    	diffAttributes(out, vnode.attributes, props);

    	isSvgMode = prevSvgMode;

    	return out;
    }

    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
    	var originalChildren = dom.childNodes,
    	    children = [],
    	    keyed = {},
    	    keyedLen = 0,
    	    min = 0,
    	    len = originalChildren.length,
    	    childrenLen = 0,
    	    vlen = vchildren ? vchildren.length : 0,
    	    j,
    	    c,
    	    f,
    	    vchild,
    	    child;

    	if (len !== 0) {
    		for (var i = 0; i < len; i++) {
    			var _child = originalChildren[i],
    			    props = _child['__preactattr_'],
    			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
    			if (key != null) {
    				keyedLen++;
    				keyed[key] = _child;
    			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
    				children[childrenLen++] = _child;
    			}
    		}
    	}

    	if (vlen !== 0) {
    		for (var i = 0; i < vlen; i++) {
    			vchild = vchildren[i];
    			child = null;

    			var key = vchild.key;
    			if (key != null) {
    				if (keyedLen && keyed[key] !== undefined) {
    					child = keyed[key];
    					keyed[key] = undefined;
    					keyedLen--;
    				}
    			} else if (min < childrenLen) {
    					for (j = min; j < childrenLen; j++) {
    						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
    							child = c;
    							children[j] = undefined;
    							if (j === childrenLen - 1) childrenLen--;
    							if (j === min) min++;
    							break;
    						}
    					}
    				}

    			child = idiff(child, vchild, context, mountAll);

    			f = originalChildren[i];
    			if (child && child !== dom && child !== f) {
    				if (f == null) {
    					dom.appendChild(child);
    				} else if (child === f.nextSibling) {
    					removeNode(f);
    				} else {
    					dom.insertBefore(child, f);
    				}
    			}
    		}
    	}

    	if (keyedLen) {
    		for (var i in keyed) {
    			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
    		}
    	}

    	while (min <= childrenLen) {
    		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
    	}
    }

    function recollectNodeTree(node, unmountOnly) {
    	var component = node._component;
    	if (component) {
    		unmountComponent(component);
    	} else {
    		if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

    		if (unmountOnly === false || node['__preactattr_'] == null) {
    			removeNode(node);
    		}

    		removeChildren(node);
    	}
    }

    function removeChildren(node) {
    	node = node.lastChild;
    	while (node) {
    		var next = node.previousSibling;
    		recollectNodeTree(node, true);
    		node = next;
    	}
    }

    function diffAttributes(dom, attrs, old) {
    	var name;

    	for (name in old) {
    		if (!(attrs && attrs[name] != null) && old[name] != null) {
    			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
    		}
    	}

    	for (name in attrs) {
    		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
    			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    		}
    	}
    }

    var recyclerComponents = [];

    function createComponent(Ctor, props, context) {
    	var inst,
    	    i = recyclerComponents.length;

    	if (Ctor.prototype && Ctor.prototype.render) {
    		inst = new Ctor(props, context);
    		Component.call(inst, props, context);
    	} else {
    		inst = new Component(props, context);
    		inst.constructor = Ctor;
    		inst.render = doRender;
    	}

    	while (i--) {
    		if (recyclerComponents[i].constructor === Ctor) {
    			inst.nextBase = recyclerComponents[i].nextBase;
    			recyclerComponents.splice(i, 1);
    			return inst;
    		}
    	}

    	return inst;
    }

    function doRender(props, state, context) {
    	return this.constructor(props, context);
    }

    function setComponentProps(component, props, renderMode, context, mountAll) {
    	if (component._disable) return;
    	component._disable = true;

    	component.__ref = props.ref;
    	component.__key = props.key;
    	delete props.ref;
    	delete props.key;

    	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
    		if (!component.base || mountAll) {
    			if (component.componentWillMount) component.componentWillMount();
    		} else if (component.componentWillReceiveProps) {
    			component.componentWillReceiveProps(props, context);
    		}
    	}

    	if (context && context !== component.context) {
    		if (!component.prevContext) component.prevContext = component.context;
    		component.context = context;
    	}

    	if (!component.prevProps) component.prevProps = component.props;
    	component.props = props;

    	component._disable = false;

    	if (renderMode !== 0) {
    		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
    			renderComponent(component, 1, mountAll);
    		} else {
    			enqueueRender(component);
    		}
    	}

    	applyRef(component.__ref, component);
    }

    function renderComponent(component, renderMode, mountAll, isChild) {
    	if (component._disable) return;

    	var props = component.props,
    	    state = component.state,
    	    context = component.context,
    	    previousProps = component.prevProps || props,
    	    previousState = component.prevState || state,
    	    previousContext = component.prevContext || context,
    	    isUpdate = component.base,
    	    nextBase = component.nextBase,
    	    initialBase = isUpdate || nextBase,
    	    initialChildComponent = component._component,
    	    skip = false,
    	    snapshot = previousContext,
    	    rendered,
    	    inst,
    	    cbase;

    	if (component.constructor.getDerivedStateFromProps) {
    		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
    		component.state = state;
    	}

    	if (isUpdate) {
    		component.props = previousProps;
    		component.state = previousState;
    		component.context = previousContext;
    		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
    			skip = true;
    		} else if (component.componentWillUpdate) {
    			component.componentWillUpdate(props, state, context);
    		}
    		component.props = props;
    		component.state = state;
    		component.context = context;
    	}

    	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
    	component._dirty = false;

    	if (!skip) {
    		rendered = component.render(props, state, context);

    		if (component.getChildContext) {
    			context = extend(extend({}, context), component.getChildContext());
    		}

    		if (isUpdate && component.getSnapshotBeforeUpdate) {
    			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
    		}

    		var childComponent = rendered && rendered.nodeName,
    		    toUnmount,
    		    base;

    		if (typeof childComponent === 'function') {

    			var childProps = getNodeProps(rendered);
    			inst = initialChildComponent;

    			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
    				setComponentProps(inst, childProps, 1, context, false);
    			} else {
    				toUnmount = inst;

    				component._component = inst = createComponent(childComponent, childProps, context);
    				inst.nextBase = inst.nextBase || nextBase;
    				inst._parentComponent = component;
    				setComponentProps(inst, childProps, 0, context, false);
    				renderComponent(inst, 1, mountAll, true);
    			}

    			base = inst.base;
    		} else {
    			cbase = initialBase;

    			toUnmount = initialChildComponent;
    			if (toUnmount) {
    				cbase = component._component = null;
    			}

    			if (initialBase || renderMode === 1) {
    				if (cbase) cbase._component = null;
    				base = diff$1(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
    			}
    		}

    		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
    			var baseParent = initialBase.parentNode;
    			if (baseParent && base !== baseParent) {
    				baseParent.replaceChild(base, initialBase);

    				if (!toUnmount) {
    					initialBase._component = null;
    					recollectNodeTree(initialBase, false);
    				}
    			}
    		}

    		if (toUnmount) {
    			unmountComponent(toUnmount);
    		}

    		component.base = base;
    		if (base && !isChild) {
    			var componentRef = component,
    			    t = component;
    			while (t = t._parentComponent) {
    				(componentRef = t).base = base;
    			}
    			base._component = componentRef;
    			base._componentConstructor = componentRef.constructor;
    		}
    	}

    	if (!isUpdate || mountAll) {
    		mounts.push(component);
    	} else if (!skip) {

    		if (component.componentDidUpdate) {
    			component.componentDidUpdate(previousProps, previousState, snapshot);
    		}
    	}

    	while (component._renderCallbacks.length) {
    		component._renderCallbacks.pop().call(component);
    	}if (!diffLevel && !isChild) flushMounts();
    }

    function buildComponentFromVNode(dom, vnode, context, mountAll) {
    	var c = dom && dom._component,
    	    originalComponent = c,
    	    oldDom = dom,
    	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
    	    isOwner = isDirectOwner,
    	    props = getNodeProps(vnode);
    	while (c && !isOwner && (c = c._parentComponent)) {
    		isOwner = c.constructor === vnode.nodeName;
    	}

    	if (c && isOwner && (!mountAll || c._component)) {
    		setComponentProps(c, props, 3, context, mountAll);
    		dom = c.base;
    	} else {
    		if (originalComponent && !isDirectOwner) {
    			unmountComponent(originalComponent);
    			dom = oldDom = null;
    		}

    		c = createComponent(vnode.nodeName, props, context);
    		if (dom && !c.nextBase) {
    			c.nextBase = dom;

    			oldDom = null;
    		}
    		setComponentProps(c, props, 1, context, mountAll);
    		dom = c.base;

    		if (oldDom && dom !== oldDom) {
    			oldDom._component = null;
    			recollectNodeTree(oldDom, false);
    		}
    	}

    	return dom;
    }

    function unmountComponent(component) {

    	var base = component.base;

    	component._disable = true;

    	if (component.componentWillUnmount) component.componentWillUnmount();

    	component.base = null;

    	var inner = component._component;
    	if (inner) {
    		unmountComponent(inner);
    	} else if (base) {
    		if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

    		component.nextBase = base;

    		removeNode(base);
    		recyclerComponents.push(component);

    		removeChildren(base);
    	}

    	applyRef(component.__ref, null);
    }

    function Component(props, context) {
    	this._dirty = true;

    	this.context = context;

    	this.props = props;

    	this.state = this.state || {};

    	this._renderCallbacks = [];
    }

    extend(Component.prototype, {
    	setState: function setState(state, callback) {
    		if (!this.prevState) this.prevState = this.state;
    		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
    		if (callback) this._renderCallbacks.push(callback);
    		enqueueRender(this);
    	},
    	forceUpdate: function forceUpdate(callback) {
    		if (callback) this._renderCallbacks.push(callback);
    		renderComponent(this, 2);
    	},
    	render: function render() {}
    });

    function render$1(vnode, parent, merge) {
      return diff$1(merge, vnode, {}, false, parent, false);
    }

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an object on which each property is observable
     * @param {any} object
     */
    const ObservableObject = object => {
      const listeners   = [];
      const subscribers = {};

      const notify = newObject => {
        if (object == newObject) return;
        const oldObject = object;
        object = newObject;

        Object.keys(newObject).forEach(key => {
          const newValue = newObject[key];
          const oldValue = oldObject[key];
          if (oldValue === newValue) return;
          (subscribers[key] || []).forEach(subscriber => subscriber(newValue, oldValue));
        });
        listeners.forEach(listener => listener(newObject, oldObject));
      };

      return {
        get:       ()              => object,
        set:       newObject       => notify({ ...object, ...newObject }),
        push:      (key, value)    => notify({ ...object, ...{ [key]: value } }),
        remove:    key             => notify({ ...object, ...{ [key]: undefined } }),
        replace:   newObject       => {
          const emptyObject = Object.assign({}, object);
          Object.keys(emptyObject).forEach(key => emptyObject[key] = undefined);
          notify({ ...emptyObject, ...newObject});
        },
        onChange:  callback        => { listeners.push(callback); callback(object, object); },
        subscribe: (key, callback) => {
          subscribers[key] = subscribers[key] || [];
          subscribers[key].push(callback);
          callback(object[key], object[key]);
        },
        // unsubscribe, removeOnChange
      };
    };

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Global store object
     */
    const store = ObservableObject({});

    /**
     * Abstract controller to use a MVC approach using the virtual DOM as a renderer.
     */
    class PuerroController {

      /**
       * Creating a new PuerroController
       * 
       * @param {HTMLElement} $root DOM element to mount view
       * @param {object} state initial state
       * @param {function(controller): VNode} view Virtual DOM creator
       * @param {boolean} diffing if diffing should be used
       */
      constructor($root, state, view, diffing = true) {
        this.$root = $root;
        this.state = ObservableObject({ ...state });
        this.view = view;
        this.diffing = diffing;
        this.vDom = null;
        this.init();
        this.onInit();
      }

      /**
       * Initial function of the Puerro Controller
       */
      init() {
        this.vDom = this.view(this);
        this.$root.prepend(render(this.vDom));
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * On Init Hook 
       */
      onInit() {}

      /**
       * Refreshs the view
       */
      refresh() {
        const newVDom = this.view(this);
        this.repaint(newVDom);
        this.vDom = newVDom;
      }

      /**
       * Repaint the virtual DOM using the DOM API
       * 
       * @param {VNode} newVDom vDom to be paintend
       */
      repaint(newVDom) {
        if (this.diffing) {
          diff(this.$root, newVDom, this.vDom);
        } else {
          this.$root.replaceChild(render(newVDom), this.$root.firstChild);
        }
      }

      /**
       * Returns the model (store and state)
       */
      get model() {
        return { ...store.get(), ...this.state.get() };
      }

      /**
       * Returns the store
       */
      get store() { return store; }

      /**
       * Static method for returning the store
       */
      static get store() { return store; }
    }

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Controller to use a MVC approach using the virtual DOM renderer of [preact](http://preactjs.com).
     */
    class PreactController extends PuerroController {
      
      /**
       * Initial function of the Preact Controller
       */
      init() {
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * Painting virtual DOM with the preact renderer.
       * 
       * @param {VNode} newVdom vDom to be paintend
       */
      repaint(newVdom) {
        render$1(newVdom, this.$root, this.$root.firstChild);
      }
    }

    const formModel = {
      id:             0,
      name:           '',
      classification: '',
      origin:         '',
      planted:        false,
      amount:         0,
      comments:       '',
    };

    class FormController extends PreactController {

      setVegetable(vegetable) {
        this.state.set(vegetable);
      }

      reset() {
        this.setVegetable({ ...formModel, id: this.model.id });
      }

      save() {
        const updatedVegetables = this.store.get().vegetables.map(v => (v.id === this.model.id ? this.state.get() : v));
        this.store.push('vegetables', updatedVegetables);
      }

      delete() {
        this.store.push('vegetables', this.store.get().vegetables.filter(v => v.id !== this.model.id));
      }
    }

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

    const originField = (origin, controller) => [
      h('input', {
        value:    origin.name,
        id:       'radio-origin-' + origin.name,
        name:     'origin',
        type:     'radio',
        required: true,
        disabled: origin.disabledOn.includes(controller.model.classification) ? true : undefined,
        checked:  controller.model.origin == origin.name
                    && !origin.disabledOn.includes(controller.model.classification) ? true : undefined,
        onChange: evt => controller.setVegetable({ origin: evt.target.value })
      }),
      h('label', { for: 'radio-origin-' + origin.name }, origin.name)
    ];

    const view = controller => h('form', { onSubmit: evt => { evt.preventDefault(); controller.save(); } },
        h('fieldset', { disabled: controller.model.id <= 0 ? true : undefined },

          h('label', {}, 'Vegetable'),
          h('input', {
            value:    controller.model.name,
            name:     'name',
            required: true,
            onChange: evt => controller.setVegetable({ name: evt.target.value })
          }),

          h('label', {}, 'Classification'),
          h('select', {
            value:    controller.model.classification,
            name:     'classification',
            required: true,
            onChange: evt => controller.setVegetable({ classification: evt.target.value })
          }, vegetableClassifications.map(classification =>
              h('option', {
                value:    classification,
                selected: controller.model.classification === classification ? true : undefined
              }, classification)
            )
          ),

          h('div', {},
            origins.map(o => originField(o, controller))
          ),

          h('label', {}, 'Amount'),
          h('div', {},
            h('label', {}, 'Planted'),
            h('input', {
              name:     'planted',
              type:     'checkbox',
              checked:  controller.model.planted ? true : undefined,
              onChange: evt => controller.setVegetable({ planted: evt.target.checked })
            }),
            controller.model.planted ? h('input', {
              value:    controller.model.amount,
              name:     'amount',
              type:     'number',
              onChange: evt => controller.setVegetable({ amount: evt.target.value}),
            }) : null
          ),

          h('label', {}, 'Comments'),
          h('textarea', {
            onChange: evt => controller.setVegetable({ comments: evt.target.value}),
          }, controller.model.comments),

          h('div', {},
            h('button', {}, 'Save'),
            h('button', { type: 'reset', onClick: evt => controller.reset(evt) }, 'Clear'),
            h('button', { type: 'button', onClick: evt => controller.delete() }, 'Delete'),
          ),

        ),
      );

    describe('Huerto - 05 - FormController', test => {
      // before
      PuerroController.store.set({ vegetables: [{ id: 1 }] });
      const $root = createDomElement('div');
      const controller = new FormController($root, formModel, view);

      // given
      const vegetable = {
        id: 1,
        name: 'Leek',
        classification: 'Fruits',
        origin: 'Asia',
        planted: true,
        amount: 4,
        comments: 'needs water daily',
      };

      test('Rendering Form', assert => {
        assert.is($root.querySelectorAll('option').length, 10);
      });

      test('Initial State', assert => {
        assert.is(PuerroController.store.get().vegetables.length, 1);
        assert.is(Object.keys(PuerroController.store.get().vegetables[0]).length, 1);
        assert.is(
          Object.entries(controller.state.get()).toString(),
          Object.entries(formModel).toString()
        );
      });

      test('Save Vegetable', assert => {

        //given
        controller.setVegetable(vegetable);

        // when
        controller.save();

        // then
        assert.is(PuerroController.store.get().vegetables.length, 1);
        assert.is(
          Object.entries(PuerroController.store.get().vegetables[0]).toString(),
          Object.entries(vegetable).toString()
        );
        assert.is(
          Object.entries(controller.state.get()).toString(),
          Object.entries(vegetable).toString()
        );
        assert.is($root.querySelector('textArea').value, 'needs water daily');
      });

      test('Reset Vegetable', assert => {
        // when
        controller.reset();

        // then
        assert.is(PuerroController.store.get().vegetables.length, 1);
        assert.is(Object.keys(PuerroController.store.get().vegetables[0]).length, 7);
        assert.is(
          Object.entries(controller.state.get()).toString(),
          Object.entries({ ...formModel, ...{ id: 1 } }).toString()
        );
        assert.is($root.querySelector('textArea').value, '');
      });

      test('Delete Vegetable', assert => {
        // when
        controller.delete();

        // then
        assert.is(PuerroController.store.get().vegetables.length, 0);
        assert.is(
          Object.entries(controller.state.get()).toString(),
          Object.entries({ ...formModel, ...{ id: 1 } }).toString()
        );
        assert.is($root.querySelector('textArea').value, '');
      });
    });

  }());

  (function () {

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

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an object on which each property is observable
     * @param {any} object
     */
    const ObservableObject = object => {
      const listeners   = [];
      const subscribers = {};

      const notify = newObject => {
        if (object == newObject) return;
        const oldObject = object;
        object = newObject;

        Object.keys(newObject).forEach(key => {
          const newValue = newObject[key];
          const oldValue = oldObject[key];
          if (oldValue === newValue) return;
          (subscribers[key] || []).forEach(subscriber => subscriber(newValue, oldValue));
        });
        listeners.forEach(listener => listener(newObject, oldObject));
      };

      return {
        get:       ()              => object,
        set:       newObject       => notify({ ...object, ...newObject }),
        push:      (key, value)    => notify({ ...object, ...{ [key]: value } }),
        remove:    key             => notify({ ...object, ...{ [key]: undefined } }),
        replace:   newObject       => {
          const emptyObject = Object.assign({}, object);
          Object.keys(emptyObject).forEach(key => emptyObject[key] = undefined);
          notify({ ...emptyObject, ...newObject});
        },
        onChange:  callback        => { listeners.push(callback); callback(object, object); },
        subscribe: (key, callback) => {
          subscribers[key] = subscribers[key] || [];
          subscribers[key].push(callback);
          callback(object[key], object[key]);
        },
        // unsubscribe, removeOnChange
      };
    };

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Global store object
     */
    const store = ObservableObject({});

    /**
     * Abstract controller to use a MVC approach using the virtual DOM as a renderer.
     */
    class PuerroController {

      /**
       * Creating a new PuerroController
       * 
       * @param {HTMLElement} $root DOM element to mount view
       * @param {object} state initial state
       * @param {function(controller): VNode} view Virtual DOM creator
       * @param {boolean} diffing if diffing should be used
       */
      constructor($root, state, view, diffing = true) {
        this.$root = $root;
        this.state = ObservableObject({ ...state });
        this.view = view;
        this.diffing = diffing;
        this.vDom = null;
        this.init();
        this.onInit();
      }

      /**
       * Initial function of the Puerro Controller
       */
      init() {
        this.vDom = this.view(this);
        this.$root.prepend(render(this.vDom));
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * On Init Hook 
       */
      onInit() {}

      /**
       * Refreshs the view
       */
      refresh() {
        const newVDom = this.view(this);
        this.repaint(newVDom);
        this.vDom = newVDom;
      }

      /**
       * Repaint the virtual DOM using the DOM API
       * 
       * @param {VNode} newVDom vDom to be paintend
       */
      repaint(newVDom) {
        if (this.diffing) {
          diff(this.$root, newVDom, this.vDom);
        } else {
          this.$root.replaceChild(render(newVDom), this.$root.firstChild);
        }
      }

      /**
       * Returns the model (store and state)
       */
      get model() {
        return { ...store.get(), ...this.state.get() };
      }

      /**
       * Returns the store
       */
      get store() { return store; }

      /**
       * Static method for returning the store
       */
      static get store() { return store; }
    }

    var VNode = function VNode() {};

    var options = {};

    var stack = [];

    var EMPTY_CHILDREN = [];

    function h(nodeName, attributes) {
    	var children = EMPTY_CHILDREN,
    	    lastSimple,
    	    child,
    	    simple,
    	    i;
    	for (i = arguments.length; i-- > 2;) {
    		stack.push(arguments[i]);
    	}
    	if (attributes && attributes.children != null) {
    		if (!stack.length) stack.push(attributes.children);
    		delete attributes.children;
    	}
    	while (stack.length) {
    		if ((child = stack.pop()) && child.pop !== undefined) {
    			for (i = child.length; i--;) {
    				stack.push(child[i]);
    			}
    		} else {
    			if (typeof child === 'boolean') child = null;

    			if (simple = typeof nodeName !== 'function') {
    				if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
    			}

    			if (simple && lastSimple) {
    				children[children.length - 1] += child;
    			} else if (children === EMPTY_CHILDREN) {
    				children = [child];
    			} else {
    				children.push(child);
    			}

    			lastSimple = simple;
    		}
    	}

    	var p = new VNode();
    	p.nodeName = nodeName;
    	p.children = children;
    	p.attributes = attributes == null ? undefined : attributes;
    	p.key = attributes == null ? undefined : attributes.key;

    	return p;
    }

    function extend(obj, props) {
      for (var i in props) {
        obj[i] = props[i];
      }return obj;
    }

    function applyRef(ref, value) {
      if (ref != null) {
        if (typeof ref == 'function') ref(value);else ref.current = value;
      }
    }

    var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

    var items = [];

    function enqueueRender(component) {
    	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
    		(defer)(rerender);
    	}
    }

    function rerender() {
    	var p;
    	while (p = items.pop()) {
    		if (p._dirty) renderComponent(p);
    	}
    }

    function isSameNodeType(node, vnode, hydrating) {
    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		return node.splitText !== undefined;
    	}
    	if (typeof vnode.nodeName === 'string') {
    		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
    	}
    	return hydrating || node._componentConstructor === vnode.nodeName;
    }

    function isNamedNode(node, nodeName) {
    	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }

    function getNodeProps(vnode) {
    	var props = extend({}, vnode.attributes);
    	props.children = vnode.children;

    	var defaultProps = vnode.nodeName.defaultProps;
    	if (defaultProps !== undefined) {
    		for (var i in defaultProps) {
    			if (props[i] === undefined) {
    				props[i] = defaultProps[i];
    			}
    		}
    	}

    	return props;
    }

    function createNode(nodeName, isSvg) {
    	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    	node.normalizedNodeName = nodeName;
    	return node;
    }

    function removeNode(node) {
    	var parentNode = node.parentNode;
    	if (parentNode) parentNode.removeChild(node);
    }

    function setAccessor(node, name, old, value, isSvg) {
    	if (name === 'className') name = 'class';

    	if (name === 'key') ; else if (name === 'ref') {
    		applyRef(old, null);
    		applyRef(value, node);
    	} else if (name === 'class' && !isSvg) {
    		node.className = value || '';
    	} else if (name === 'style') {
    		if (!value || typeof value === 'string' || typeof old === 'string') {
    			node.style.cssText = value || '';
    		}
    		if (value && typeof value === 'object') {
    			if (typeof old !== 'string') {
    				for (var i in old) {
    					if (!(i in value)) node.style[i] = '';
    				}
    			}
    			for (var i in value) {
    				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
    			}
    		}
    	} else if (name === 'dangerouslySetInnerHTML') {
    		if (value) node.innerHTML = value.__html || '';
    	} else if (name[0] == 'o' && name[1] == 'n') {
    		var useCapture = name !== (name = name.replace(/Capture$/, ''));
    		name = name.toLowerCase().substring(2);
    		if (value) {
    			if (!old) node.addEventListener(name, eventProxy, useCapture);
    		} else {
    			node.removeEventListener(name, eventProxy, useCapture);
    		}
    		(node._listeners || (node._listeners = {}))[name] = value;
    	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
    		try {
    			node[name] = value == null ? '' : value;
    		} catch (e) {}
    		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
    	} else {
    		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

    		if (value == null || value === false) {
    			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
    		} else if (typeof value !== 'function') {
    			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
    		}
    	}
    }

    function eventProxy(e) {
    	return this._listeners[e.type](e);
    }

    var mounts = [];

    var diffLevel = 0;

    var isSvgMode = false;

    var hydrating = false;

    function flushMounts() {
    	var c;
    	while (c = mounts.shift()) {
    		if (c.componentDidMount) c.componentDidMount();
    	}
    }

    function diff$1(dom, vnode, context, mountAll, parent, componentRoot) {
    	if (!diffLevel++) {
    		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

    		hydrating = dom != null && !('__preactattr_' in dom);
    	}

    	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

    	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

    	if (! --diffLevel) {
    		hydrating = false;

    		if (!componentRoot) flushMounts();
    	}

    	return ret;
    }

    function idiff(dom, vnode, context, mountAll, componentRoot) {
    	var out = dom,
    	    prevSvgMode = isSvgMode;

    	if (vnode == null || typeof vnode === 'boolean') vnode = '';

    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
    			if (dom.nodeValue != vnode) {
    				dom.nodeValue = vnode;
    			}
    		} else {
    			out = document.createTextNode(vnode);
    			if (dom) {
    				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
    				recollectNodeTree(dom, true);
    			}
    		}

    		out['__preactattr_'] = true;

    		return out;
    	}

    	var vnodeName = vnode.nodeName;
    	if (typeof vnodeName === 'function') {
    		return buildComponentFromVNode(dom, vnode, context, mountAll);
    	}

    	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

    	vnodeName = String(vnodeName);
    	if (!dom || !isNamedNode(dom, vnodeName)) {
    		out = createNode(vnodeName, isSvgMode);

    		if (dom) {
    			while (dom.firstChild) {
    				out.appendChild(dom.firstChild);
    			}
    			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

    			recollectNodeTree(dom, true);
    		}
    	}

    	var fc = out.firstChild,
    	    props = out['__preactattr_'],
    	    vchildren = vnode.children;

    	if (props == null) {
    		props = out['__preactattr_'] = {};
    		for (var a = out.attributes, i = a.length; i--;) {
    			props[a[i].name] = a[i].value;
    		}
    	}

    	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
    		if (fc.nodeValue != vchildren[0]) {
    			fc.nodeValue = vchildren[0];
    		}
    	} else if (vchildren && vchildren.length || fc != null) {
    			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
    		}

    	diffAttributes(out, vnode.attributes, props);

    	isSvgMode = prevSvgMode;

    	return out;
    }

    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
    	var originalChildren = dom.childNodes,
    	    children = [],
    	    keyed = {},
    	    keyedLen = 0,
    	    min = 0,
    	    len = originalChildren.length,
    	    childrenLen = 0,
    	    vlen = vchildren ? vchildren.length : 0,
    	    j,
    	    c,
    	    f,
    	    vchild,
    	    child;

    	if (len !== 0) {
    		for (var i = 0; i < len; i++) {
    			var _child = originalChildren[i],
    			    props = _child['__preactattr_'],
    			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
    			if (key != null) {
    				keyedLen++;
    				keyed[key] = _child;
    			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
    				children[childrenLen++] = _child;
    			}
    		}
    	}

    	if (vlen !== 0) {
    		for (var i = 0; i < vlen; i++) {
    			vchild = vchildren[i];
    			child = null;

    			var key = vchild.key;
    			if (key != null) {
    				if (keyedLen && keyed[key] !== undefined) {
    					child = keyed[key];
    					keyed[key] = undefined;
    					keyedLen--;
    				}
    			} else if (min < childrenLen) {
    					for (j = min; j < childrenLen; j++) {
    						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
    							child = c;
    							children[j] = undefined;
    							if (j === childrenLen - 1) childrenLen--;
    							if (j === min) min++;
    							break;
    						}
    					}
    				}

    			child = idiff(child, vchild, context, mountAll);

    			f = originalChildren[i];
    			if (child && child !== dom && child !== f) {
    				if (f == null) {
    					dom.appendChild(child);
    				} else if (child === f.nextSibling) {
    					removeNode(f);
    				} else {
    					dom.insertBefore(child, f);
    				}
    			}
    		}
    	}

    	if (keyedLen) {
    		for (var i in keyed) {
    			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
    		}
    	}

    	while (min <= childrenLen) {
    		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
    	}
    }

    function recollectNodeTree(node, unmountOnly) {
    	var component = node._component;
    	if (component) {
    		unmountComponent(component);
    	} else {
    		if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

    		if (unmountOnly === false || node['__preactattr_'] == null) {
    			removeNode(node);
    		}

    		removeChildren(node);
    	}
    }

    function removeChildren(node) {
    	node = node.lastChild;
    	while (node) {
    		var next = node.previousSibling;
    		recollectNodeTree(node, true);
    		node = next;
    	}
    }

    function diffAttributes(dom, attrs, old) {
    	var name;

    	for (name in old) {
    		if (!(attrs && attrs[name] != null) && old[name] != null) {
    			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
    		}
    	}

    	for (name in attrs) {
    		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
    			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    		}
    	}
    }

    var recyclerComponents = [];

    function createComponent(Ctor, props, context) {
    	var inst,
    	    i = recyclerComponents.length;

    	if (Ctor.prototype && Ctor.prototype.render) {
    		inst = new Ctor(props, context);
    		Component.call(inst, props, context);
    	} else {
    		inst = new Component(props, context);
    		inst.constructor = Ctor;
    		inst.render = doRender;
    	}

    	while (i--) {
    		if (recyclerComponents[i].constructor === Ctor) {
    			inst.nextBase = recyclerComponents[i].nextBase;
    			recyclerComponents.splice(i, 1);
    			return inst;
    		}
    	}

    	return inst;
    }

    function doRender(props, state, context) {
    	return this.constructor(props, context);
    }

    function setComponentProps(component, props, renderMode, context, mountAll) {
    	if (component._disable) return;
    	component._disable = true;

    	component.__ref = props.ref;
    	component.__key = props.key;
    	delete props.ref;
    	delete props.key;

    	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
    		if (!component.base || mountAll) {
    			if (component.componentWillMount) component.componentWillMount();
    		} else if (component.componentWillReceiveProps) {
    			component.componentWillReceiveProps(props, context);
    		}
    	}

    	if (context && context !== component.context) {
    		if (!component.prevContext) component.prevContext = component.context;
    		component.context = context;
    	}

    	if (!component.prevProps) component.prevProps = component.props;
    	component.props = props;

    	component._disable = false;

    	if (renderMode !== 0) {
    		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
    			renderComponent(component, 1, mountAll);
    		} else {
    			enqueueRender(component);
    		}
    	}

    	applyRef(component.__ref, component);
    }

    function renderComponent(component, renderMode, mountAll, isChild) {
    	if (component._disable) return;

    	var props = component.props,
    	    state = component.state,
    	    context = component.context,
    	    previousProps = component.prevProps || props,
    	    previousState = component.prevState || state,
    	    previousContext = component.prevContext || context,
    	    isUpdate = component.base,
    	    nextBase = component.nextBase,
    	    initialBase = isUpdate || nextBase,
    	    initialChildComponent = component._component,
    	    skip = false,
    	    snapshot = previousContext,
    	    rendered,
    	    inst,
    	    cbase;

    	if (component.constructor.getDerivedStateFromProps) {
    		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
    		component.state = state;
    	}

    	if (isUpdate) {
    		component.props = previousProps;
    		component.state = previousState;
    		component.context = previousContext;
    		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
    			skip = true;
    		} else if (component.componentWillUpdate) {
    			component.componentWillUpdate(props, state, context);
    		}
    		component.props = props;
    		component.state = state;
    		component.context = context;
    	}

    	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
    	component._dirty = false;

    	if (!skip) {
    		rendered = component.render(props, state, context);

    		if (component.getChildContext) {
    			context = extend(extend({}, context), component.getChildContext());
    		}

    		if (isUpdate && component.getSnapshotBeforeUpdate) {
    			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
    		}

    		var childComponent = rendered && rendered.nodeName,
    		    toUnmount,
    		    base;

    		if (typeof childComponent === 'function') {

    			var childProps = getNodeProps(rendered);
    			inst = initialChildComponent;

    			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
    				setComponentProps(inst, childProps, 1, context, false);
    			} else {
    				toUnmount = inst;

    				component._component = inst = createComponent(childComponent, childProps, context);
    				inst.nextBase = inst.nextBase || nextBase;
    				inst._parentComponent = component;
    				setComponentProps(inst, childProps, 0, context, false);
    				renderComponent(inst, 1, mountAll, true);
    			}

    			base = inst.base;
    		} else {
    			cbase = initialBase;

    			toUnmount = initialChildComponent;
    			if (toUnmount) {
    				cbase = component._component = null;
    			}

    			if (initialBase || renderMode === 1) {
    				if (cbase) cbase._component = null;
    				base = diff$1(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
    			}
    		}

    		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
    			var baseParent = initialBase.parentNode;
    			if (baseParent && base !== baseParent) {
    				baseParent.replaceChild(base, initialBase);

    				if (!toUnmount) {
    					initialBase._component = null;
    					recollectNodeTree(initialBase, false);
    				}
    			}
    		}

    		if (toUnmount) {
    			unmountComponent(toUnmount);
    		}

    		component.base = base;
    		if (base && !isChild) {
    			var componentRef = component,
    			    t = component;
    			while (t = t._parentComponent) {
    				(componentRef = t).base = base;
    			}
    			base._component = componentRef;
    			base._componentConstructor = componentRef.constructor;
    		}
    	}

    	if (!isUpdate || mountAll) {
    		mounts.push(component);
    	} else if (!skip) {

    		if (component.componentDidUpdate) {
    			component.componentDidUpdate(previousProps, previousState, snapshot);
    		}
    	}

    	while (component._renderCallbacks.length) {
    		component._renderCallbacks.pop().call(component);
    	}if (!diffLevel && !isChild) flushMounts();
    }

    function buildComponentFromVNode(dom, vnode, context, mountAll) {
    	var c = dom && dom._component,
    	    originalComponent = c,
    	    oldDom = dom,
    	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
    	    isOwner = isDirectOwner,
    	    props = getNodeProps(vnode);
    	while (c && !isOwner && (c = c._parentComponent)) {
    		isOwner = c.constructor === vnode.nodeName;
    	}

    	if (c && isOwner && (!mountAll || c._component)) {
    		setComponentProps(c, props, 3, context, mountAll);
    		dom = c.base;
    	} else {
    		if (originalComponent && !isDirectOwner) {
    			unmountComponent(originalComponent);
    			dom = oldDom = null;
    		}

    		c = createComponent(vnode.nodeName, props, context);
    		if (dom && !c.nextBase) {
    			c.nextBase = dom;

    			oldDom = null;
    		}
    		setComponentProps(c, props, 1, context, mountAll);
    		dom = c.base;

    		if (oldDom && dom !== oldDom) {
    			oldDom._component = null;
    			recollectNodeTree(oldDom, false);
    		}
    	}

    	return dom;
    }

    function unmountComponent(component) {

    	var base = component.base;

    	component._disable = true;

    	if (component.componentWillUnmount) component.componentWillUnmount();

    	component.base = null;

    	var inner = component._component;
    	if (inner) {
    		unmountComponent(inner);
    	} else if (base) {
    		if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

    		component.nextBase = base;

    		removeNode(base);
    		recyclerComponents.push(component);

    		removeChildren(base);
    	}

    	applyRef(component.__ref, null);
    }

    function Component(props, context) {
    	this._dirty = true;

    	this.context = context;

    	this.props = props;

    	this.state = this.state || {};

    	this._renderCallbacks = [];
    }

    extend(Component.prototype, {
    	setState: function setState(state, callback) {
    		if (!this.prevState) this.prevState = this.state;
    		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
    		if (callback) this._renderCallbacks.push(callback);
    		enqueueRender(this);
    	},
    	forceUpdate: function forceUpdate(callback) {
    		if (callback) this._renderCallbacks.push(callback);
    		renderComponent(this, 2);
    	},
    	render: function render() {}
    });

    function render$1(vnode, parent, merge) {
      return diff$1(merge, vnode, {}, false, parent, false);
    }

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Controller to use a MVC approach using the virtual DOM renderer of [preact](http://preactjs.com).
     */
    class PreactController extends PuerroController {
      
      /**
       * Initial function of the Preact Controller
       */
      init() {
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * Painting virtual DOM with the preact renderer.
       * 
       * @param {VNode} newVdom vDom to be paintend
       */
      repaint(newVdom) {
        render$1(newVdom, this.$root, this.$root.firstChild);
      }
    }

    const formModel = {
      id:             0,
      name:           '',
      classification: '',
      origin:         '',
      planted:        false,
      amount:         0,
      comments:       '',
    };

    class ListController extends PreactController {

      onInit() {
        this.id = 0;
        this.store.subscribe('vegetables', (vegetables, oldVegetables) => {
          const selectedId = this.state.get().selected.id;
          const index      = oldVegetables.indexOf(oldVegetables.find(v => v.id === selectedId));

          let vegetable = vegetables[index] || vegetables[index-1] || formModel;
          this.selectVegetable(vegetable);
          //TODO: Consider ObservableList for vegetables in store?
        });
      }

      nextId() {
        return ++this.id;
      }

      addVegetable() {
        const vegetable = { ...formModel, id: this.nextId() };
        this.store.set({
          vegetables: [...this.model.vegetables, vegetable],
        });
        this.selectVegetable(vegetable);
      }

      selectVegetable(vegetable) {
        this.state.set({ selected: vegetable });
      }

    }

    const listModel = {
      selected: {},
    };

    const view = controller =>
      h('div', {},
        h('button', { onClick: evt => controller.addVegetable() }, '+'),
        h('table', {},
          h('thead', {},
            h('tr', {},
              h('th', {}, 'Id'),
              h('th', {}, 'Name'),
              h('th', {}, 'Classification'),
              h('th', {}, 'Origin'),
              h('th', {}, 'Amount'),
            )
          ),
          h('tbody', {}, controller.model.vegetables.map(v =>
            h('tr', {
              style: 'color:' + (v.id === controller.model.selected.id ? 'red' : 'black'),
              onClick: evt => controller.selectVegetable(v)
            },
              h('td', {}, v.id),
              h('td', {}, v.name),
              h('td', {}, v.classification),
              h('td', {}, v.origin),
              h('td', {}, v.amount),
            ))
          )
        )
      );

    describe('Huerto - 05 - ListController', test => {
      // before
      PuerroController.store.set({ vegetables: [{ id: 1 }] });
      const $root = createDomElement('div');
      const controller = new ListController($root, listModel, view);

      test('Render list', assert => {
        const $tds = $root.querySelectorAll('td');
        assert.is($tds.length, 5);
        assert.is($tds[0].innerText, '1');
      });

      test('Initial State', assert => {
        assert.is(PuerroController.store.get().vegetables.length, 1);
        assert.is(Object.keys(PuerroController.store.get().vegetables[0]).length, 1);
        assert.is(
          Object.entries(controller.state.get()).toString(),
          Object.entries(listModel).toString()
        );
      });

      test('addVegetable', assert => {
        // when
        controller.addVegetable();

        // then
        assert.is(PuerroController.store.get().vegetables.length, 2);
        assert.is(controller.state.get().selected.id, 1);
      });

      test('selectVegetable', assert => {
        // when
        controller.selectVegetable(PuerroController.store.get().vegetables[0]);

        // then
        assert.is(PuerroController.store.get().vegetables[0], controller.state.get().selected);
      });
    });

  }());

  (function () {

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

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an object on which each property is observable
     * @param {any} object
     */
    const ObservableObject = object => {
      const listeners   = [];
      const subscribers = {};

      const notify = newObject => {
        if (object == newObject) return;
        const oldObject = object;
        object = newObject;

        Object.keys(newObject).forEach(key => {
          const newValue = newObject[key];
          const oldValue = oldObject[key];
          if (oldValue === newValue) return;
          (subscribers[key] || []).forEach(subscriber => subscriber(newValue, oldValue));
        });
        listeners.forEach(listener => listener(newObject, oldObject));
      };

      return {
        get:       ()              => object,
        set:       newObject       => notify({ ...object, ...newObject }),
        push:      (key, value)    => notify({ ...object, ...{ [key]: value } }),
        remove:    key             => notify({ ...object, ...{ [key]: undefined } }),
        replace:   newObject       => {
          const emptyObject = Object.assign({}, object);
          Object.keys(emptyObject).forEach(key => emptyObject[key] = undefined);
          notify({ ...emptyObject, ...newObject});
        },
        onChange:  callback        => { listeners.push(callback); callback(object, object); },
        subscribe: (key, callback) => {
          subscribers[key] = subscribers[key] || [];
          subscribers[key].push(callback);
          callback(object[key], object[key]);
        },
        // unsubscribe, removeOnChange
      };
    };

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Global store object
     */
    const store = ObservableObject({});

    /**
     * Abstract controller to use a MVC approach using the virtual DOM as a renderer.
     */
    class PuerroController {

      /**
       * Creating a new PuerroController
       * 
       * @param {HTMLElement} $root DOM element to mount view
       * @param {object} state initial state
       * @param {function(controller): VNode} view Virtual DOM creator
       * @param {boolean} diffing if diffing should be used
       */
      constructor($root, state, view, diffing = true) {
        this.$root = $root;
        this.state = ObservableObject({ ...state });
        this.view = view;
        this.diffing = diffing;
        this.vDom = null;
        this.init();
        this.onInit();
      }

      /**
       * Initial function of the Puerro Controller
       */
      init() {
        this.vDom = this.view(this);
        this.$root.prepend(render(this.vDom));
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * On Init Hook 
       */
      onInit() {}

      /**
       * Refreshs the view
       */
      refresh() {
        const newVDom = this.view(this);
        this.repaint(newVDom);
        this.vDom = newVDom;
      }

      /**
       * Repaint the virtual DOM using the DOM API
       * 
       * @param {VNode} newVDom vDom to be paintend
       */
      repaint(newVDom) {
        if (this.diffing) {
          diff(this.$root, newVDom, this.vDom);
        } else {
          this.$root.replaceChild(render(newVDom), this.$root.firstChild);
        }
      }

      /**
       * Returns the model (store and state)
       */
      get model() {
        return { ...store.get(), ...this.state.get() };
      }

      /**
       * Returns the store
       */
      get store() { return store; }

      /**
       * Static method for returning the store
       */
      static get store() { return store; }
    }

    var VNode = function VNode() {};

    var options = {};

    var stack = [];

    var EMPTY_CHILDREN = [];

    function h(nodeName, attributes) {
    	var children = EMPTY_CHILDREN,
    	    lastSimple,
    	    child,
    	    simple,
    	    i;
    	for (i = arguments.length; i-- > 2;) {
    		stack.push(arguments[i]);
    	}
    	if (attributes && attributes.children != null) {
    		if (!stack.length) stack.push(attributes.children);
    		delete attributes.children;
    	}
    	while (stack.length) {
    		if ((child = stack.pop()) && child.pop !== undefined) {
    			for (i = child.length; i--;) {
    				stack.push(child[i]);
    			}
    		} else {
    			if (typeof child === 'boolean') child = null;

    			if (simple = typeof nodeName !== 'function') {
    				if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
    			}

    			if (simple && lastSimple) {
    				children[children.length - 1] += child;
    			} else if (children === EMPTY_CHILDREN) {
    				children = [child];
    			} else {
    				children.push(child);
    			}

    			lastSimple = simple;
    		}
    	}

    	var p = new VNode();
    	p.nodeName = nodeName;
    	p.children = children;
    	p.attributes = attributes == null ? undefined : attributes;
    	p.key = attributes == null ? undefined : attributes.key;

    	return p;
    }

    function extend(obj, props) {
      for (var i in props) {
        obj[i] = props[i];
      }return obj;
    }

    function applyRef(ref, value) {
      if (ref != null) {
        if (typeof ref == 'function') ref(value);else ref.current = value;
      }
    }

    var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

    var items = [];

    function enqueueRender(component) {
    	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
    		(defer)(rerender);
    	}
    }

    function rerender() {
    	var p;
    	while (p = items.pop()) {
    		if (p._dirty) renderComponent(p);
    	}
    }

    function isSameNodeType(node, vnode, hydrating) {
    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		return node.splitText !== undefined;
    	}
    	if (typeof vnode.nodeName === 'string') {
    		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
    	}
    	return hydrating || node._componentConstructor === vnode.nodeName;
    }

    function isNamedNode(node, nodeName) {
    	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }

    function getNodeProps(vnode) {
    	var props = extend({}, vnode.attributes);
    	props.children = vnode.children;

    	var defaultProps = vnode.nodeName.defaultProps;
    	if (defaultProps !== undefined) {
    		for (var i in defaultProps) {
    			if (props[i] === undefined) {
    				props[i] = defaultProps[i];
    			}
    		}
    	}

    	return props;
    }

    function createNode(nodeName, isSvg) {
    	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    	node.normalizedNodeName = nodeName;
    	return node;
    }

    function removeNode(node) {
    	var parentNode = node.parentNode;
    	if (parentNode) parentNode.removeChild(node);
    }

    function setAccessor(node, name, old, value, isSvg) {
    	if (name === 'className') name = 'class';

    	if (name === 'key') ; else if (name === 'ref') {
    		applyRef(old, null);
    		applyRef(value, node);
    	} else if (name === 'class' && !isSvg) {
    		node.className = value || '';
    	} else if (name === 'style') {
    		if (!value || typeof value === 'string' || typeof old === 'string') {
    			node.style.cssText = value || '';
    		}
    		if (value && typeof value === 'object') {
    			if (typeof old !== 'string') {
    				for (var i in old) {
    					if (!(i in value)) node.style[i] = '';
    				}
    			}
    			for (var i in value) {
    				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
    			}
    		}
    	} else if (name === 'dangerouslySetInnerHTML') {
    		if (value) node.innerHTML = value.__html || '';
    	} else if (name[0] == 'o' && name[1] == 'n') {
    		var useCapture = name !== (name = name.replace(/Capture$/, ''));
    		name = name.toLowerCase().substring(2);
    		if (value) {
    			if (!old) node.addEventListener(name, eventProxy, useCapture);
    		} else {
    			node.removeEventListener(name, eventProxy, useCapture);
    		}
    		(node._listeners || (node._listeners = {}))[name] = value;
    	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
    		try {
    			node[name] = value == null ? '' : value;
    		} catch (e) {}
    		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
    	} else {
    		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

    		if (value == null || value === false) {
    			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
    		} else if (typeof value !== 'function') {
    			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
    		}
    	}
    }

    function eventProxy(e) {
    	return this._listeners[e.type](e);
    }

    var mounts = [];

    var diffLevel = 0;

    var isSvgMode = false;

    var hydrating = false;

    function flushMounts() {
    	var c;
    	while (c = mounts.shift()) {
    		if (c.componentDidMount) c.componentDidMount();
    	}
    }

    function diff$1(dom, vnode, context, mountAll, parent, componentRoot) {
    	if (!diffLevel++) {
    		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

    		hydrating = dom != null && !('__preactattr_' in dom);
    	}

    	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

    	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

    	if (! --diffLevel) {
    		hydrating = false;

    		if (!componentRoot) flushMounts();
    	}

    	return ret;
    }

    function idiff(dom, vnode, context, mountAll, componentRoot) {
    	var out = dom,
    	    prevSvgMode = isSvgMode;

    	if (vnode == null || typeof vnode === 'boolean') vnode = '';

    	if (typeof vnode === 'string' || typeof vnode === 'number') {
    		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
    			if (dom.nodeValue != vnode) {
    				dom.nodeValue = vnode;
    			}
    		} else {
    			out = document.createTextNode(vnode);
    			if (dom) {
    				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
    				recollectNodeTree(dom, true);
    			}
    		}

    		out['__preactattr_'] = true;

    		return out;
    	}

    	var vnodeName = vnode.nodeName;
    	if (typeof vnodeName === 'function') {
    		return buildComponentFromVNode(dom, vnode, context, mountAll);
    	}

    	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

    	vnodeName = String(vnodeName);
    	if (!dom || !isNamedNode(dom, vnodeName)) {
    		out = createNode(vnodeName, isSvgMode);

    		if (dom) {
    			while (dom.firstChild) {
    				out.appendChild(dom.firstChild);
    			}
    			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

    			recollectNodeTree(dom, true);
    		}
    	}

    	var fc = out.firstChild,
    	    props = out['__preactattr_'],
    	    vchildren = vnode.children;

    	if (props == null) {
    		props = out['__preactattr_'] = {};
    		for (var a = out.attributes, i = a.length; i--;) {
    			props[a[i].name] = a[i].value;
    		}
    	}

    	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
    		if (fc.nodeValue != vchildren[0]) {
    			fc.nodeValue = vchildren[0];
    		}
    	} else if (vchildren && vchildren.length || fc != null) {
    			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
    		}

    	diffAttributes(out, vnode.attributes, props);

    	isSvgMode = prevSvgMode;

    	return out;
    }

    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
    	var originalChildren = dom.childNodes,
    	    children = [],
    	    keyed = {},
    	    keyedLen = 0,
    	    min = 0,
    	    len = originalChildren.length,
    	    childrenLen = 0,
    	    vlen = vchildren ? vchildren.length : 0,
    	    j,
    	    c,
    	    f,
    	    vchild,
    	    child;

    	if (len !== 0) {
    		for (var i = 0; i < len; i++) {
    			var _child = originalChildren[i],
    			    props = _child['__preactattr_'],
    			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
    			if (key != null) {
    				keyedLen++;
    				keyed[key] = _child;
    			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
    				children[childrenLen++] = _child;
    			}
    		}
    	}

    	if (vlen !== 0) {
    		for (var i = 0; i < vlen; i++) {
    			vchild = vchildren[i];
    			child = null;

    			var key = vchild.key;
    			if (key != null) {
    				if (keyedLen && keyed[key] !== undefined) {
    					child = keyed[key];
    					keyed[key] = undefined;
    					keyedLen--;
    				}
    			} else if (min < childrenLen) {
    					for (j = min; j < childrenLen; j++) {
    						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
    							child = c;
    							children[j] = undefined;
    							if (j === childrenLen - 1) childrenLen--;
    							if (j === min) min++;
    							break;
    						}
    					}
    				}

    			child = idiff(child, vchild, context, mountAll);

    			f = originalChildren[i];
    			if (child && child !== dom && child !== f) {
    				if (f == null) {
    					dom.appendChild(child);
    				} else if (child === f.nextSibling) {
    					removeNode(f);
    				} else {
    					dom.insertBefore(child, f);
    				}
    			}
    		}
    	}

    	if (keyedLen) {
    		for (var i in keyed) {
    			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
    		}
    	}

    	while (min <= childrenLen) {
    		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
    	}
    }

    function recollectNodeTree(node, unmountOnly) {
    	var component = node._component;
    	if (component) {
    		unmountComponent(component);
    	} else {
    		if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

    		if (unmountOnly === false || node['__preactattr_'] == null) {
    			removeNode(node);
    		}

    		removeChildren(node);
    	}
    }

    function removeChildren(node) {
    	node = node.lastChild;
    	while (node) {
    		var next = node.previousSibling;
    		recollectNodeTree(node, true);
    		node = next;
    	}
    }

    function diffAttributes(dom, attrs, old) {
    	var name;

    	for (name in old) {
    		if (!(attrs && attrs[name] != null) && old[name] != null) {
    			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
    		}
    	}

    	for (name in attrs) {
    		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
    			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    		}
    	}
    }

    var recyclerComponents = [];

    function createComponent(Ctor, props, context) {
    	var inst,
    	    i = recyclerComponents.length;

    	if (Ctor.prototype && Ctor.prototype.render) {
    		inst = new Ctor(props, context);
    		Component.call(inst, props, context);
    	} else {
    		inst = new Component(props, context);
    		inst.constructor = Ctor;
    		inst.render = doRender;
    	}

    	while (i--) {
    		if (recyclerComponents[i].constructor === Ctor) {
    			inst.nextBase = recyclerComponents[i].nextBase;
    			recyclerComponents.splice(i, 1);
    			return inst;
    		}
    	}

    	return inst;
    }

    function doRender(props, state, context) {
    	return this.constructor(props, context);
    }

    function setComponentProps(component, props, renderMode, context, mountAll) {
    	if (component._disable) return;
    	component._disable = true;

    	component.__ref = props.ref;
    	component.__key = props.key;
    	delete props.ref;
    	delete props.key;

    	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
    		if (!component.base || mountAll) {
    			if (component.componentWillMount) component.componentWillMount();
    		} else if (component.componentWillReceiveProps) {
    			component.componentWillReceiveProps(props, context);
    		}
    	}

    	if (context && context !== component.context) {
    		if (!component.prevContext) component.prevContext = component.context;
    		component.context = context;
    	}

    	if (!component.prevProps) component.prevProps = component.props;
    	component.props = props;

    	component._disable = false;

    	if (renderMode !== 0) {
    		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
    			renderComponent(component, 1, mountAll);
    		} else {
    			enqueueRender(component);
    		}
    	}

    	applyRef(component.__ref, component);
    }

    function renderComponent(component, renderMode, mountAll, isChild) {
    	if (component._disable) return;

    	var props = component.props,
    	    state = component.state,
    	    context = component.context,
    	    previousProps = component.prevProps || props,
    	    previousState = component.prevState || state,
    	    previousContext = component.prevContext || context,
    	    isUpdate = component.base,
    	    nextBase = component.nextBase,
    	    initialBase = isUpdate || nextBase,
    	    initialChildComponent = component._component,
    	    skip = false,
    	    snapshot = previousContext,
    	    rendered,
    	    inst,
    	    cbase;

    	if (component.constructor.getDerivedStateFromProps) {
    		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
    		component.state = state;
    	}

    	if (isUpdate) {
    		component.props = previousProps;
    		component.state = previousState;
    		component.context = previousContext;
    		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
    			skip = true;
    		} else if (component.componentWillUpdate) {
    			component.componentWillUpdate(props, state, context);
    		}
    		component.props = props;
    		component.state = state;
    		component.context = context;
    	}

    	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
    	component._dirty = false;

    	if (!skip) {
    		rendered = component.render(props, state, context);

    		if (component.getChildContext) {
    			context = extend(extend({}, context), component.getChildContext());
    		}

    		if (isUpdate && component.getSnapshotBeforeUpdate) {
    			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
    		}

    		var childComponent = rendered && rendered.nodeName,
    		    toUnmount,
    		    base;

    		if (typeof childComponent === 'function') {

    			var childProps = getNodeProps(rendered);
    			inst = initialChildComponent;

    			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
    				setComponentProps(inst, childProps, 1, context, false);
    			} else {
    				toUnmount = inst;

    				component._component = inst = createComponent(childComponent, childProps, context);
    				inst.nextBase = inst.nextBase || nextBase;
    				inst._parentComponent = component;
    				setComponentProps(inst, childProps, 0, context, false);
    				renderComponent(inst, 1, mountAll, true);
    			}

    			base = inst.base;
    		} else {
    			cbase = initialBase;

    			toUnmount = initialChildComponent;
    			if (toUnmount) {
    				cbase = component._component = null;
    			}

    			if (initialBase || renderMode === 1) {
    				if (cbase) cbase._component = null;
    				base = diff$1(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
    			}
    		}

    		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
    			var baseParent = initialBase.parentNode;
    			if (baseParent && base !== baseParent) {
    				baseParent.replaceChild(base, initialBase);

    				if (!toUnmount) {
    					initialBase._component = null;
    					recollectNodeTree(initialBase, false);
    				}
    			}
    		}

    		if (toUnmount) {
    			unmountComponent(toUnmount);
    		}

    		component.base = base;
    		if (base && !isChild) {
    			var componentRef = component,
    			    t = component;
    			while (t = t._parentComponent) {
    				(componentRef = t).base = base;
    			}
    			base._component = componentRef;
    			base._componentConstructor = componentRef.constructor;
    		}
    	}

    	if (!isUpdate || mountAll) {
    		mounts.push(component);
    	} else if (!skip) {

    		if (component.componentDidUpdate) {
    			component.componentDidUpdate(previousProps, previousState, snapshot);
    		}
    	}

    	while (component._renderCallbacks.length) {
    		component._renderCallbacks.pop().call(component);
    	}if (!diffLevel && !isChild) flushMounts();
    }

    function buildComponentFromVNode(dom, vnode, context, mountAll) {
    	var c = dom && dom._component,
    	    originalComponent = c,
    	    oldDom = dom,
    	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
    	    isOwner = isDirectOwner,
    	    props = getNodeProps(vnode);
    	while (c && !isOwner && (c = c._parentComponent)) {
    		isOwner = c.constructor === vnode.nodeName;
    	}

    	if (c && isOwner && (!mountAll || c._component)) {
    		setComponentProps(c, props, 3, context, mountAll);
    		dom = c.base;
    	} else {
    		if (originalComponent && !isDirectOwner) {
    			unmountComponent(originalComponent);
    			dom = oldDom = null;
    		}

    		c = createComponent(vnode.nodeName, props, context);
    		if (dom && !c.nextBase) {
    			c.nextBase = dom;

    			oldDom = null;
    		}
    		setComponentProps(c, props, 1, context, mountAll);
    		dom = c.base;

    		if (oldDom && dom !== oldDom) {
    			oldDom._component = null;
    			recollectNodeTree(oldDom, false);
    		}
    	}

    	return dom;
    }

    function unmountComponent(component) {

    	var base = component.base;

    	component._disable = true;

    	if (component.componentWillUnmount) component.componentWillUnmount();

    	component.base = null;

    	var inner = component._component;
    	if (inner) {
    		unmountComponent(inner);
    	} else if (base) {
    		if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

    		component.nextBase = base;

    		removeNode(base);
    		recyclerComponents.push(component);

    		removeChildren(base);
    	}

    	applyRef(component.__ref, null);
    }

    function Component(props, context) {
    	this._dirty = true;

    	this.context = context;

    	this.props = props;

    	this.state = this.state || {};

    	this._renderCallbacks = [];
    }

    extend(Component.prototype, {
    	setState: function setState(state, callback) {
    		if (!this.prevState) this.prevState = this.state;
    		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
    		if (callback) this._renderCallbacks.push(callback);
    		enqueueRender(this);
    	},
    	forceUpdate: function forceUpdate(callback) {
    		if (callback) this._renderCallbacks.push(callback);
    		renderComponent(this, 2);
    	},
    	render: function render() {}
    });

    function render$1(vnode, parent, merge) {
      return diff$1(merge, vnode, {}, false, parent, false);
    }

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Controller to use a MVC approach using the virtual DOM renderer of [preact](http://preactjs.com).
     */
    class PreactController extends PuerroController {
      
      /**
       * Initial function of the Preact Controller
       */
      init() {
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * Painting virtual DOM with the preact renderer.
       * 
       * @param {VNode} newVdom vDom to be paintend
       */
      repaint(newVdom) {
        render$1(newVdom, this.$root, this.$root.firstChild);
      }
    }

    class OverviewController extends PreactController {

      getPlantedCounts() {
        return this.store.get().vegetables.filter(v => v.planted).length
      }
    }

    const view = controller =>
      h('label', {}, controller.getPlantedCounts() + '/' + controller.model.vegetables.length);

    describe('Huerto - 05 - OverviewController', test => {
      // before
      PuerroController.store.set({ vegetables: [{ id: 1 }] });
      const $root = createDomElement('div');
      const controller = new OverviewController($root, {}, view);

      test('Render overview', assert => {
        const $label = $root.querySelector('label');
        assert.is($label.innerText, '0/1');
      });

      test('Initial State', assert => {
        assert.is(PuerroController.store.get().vegetables.length, 1);
        assert.is(Object.keys(PuerroController.store.get().vegetables[0]).length, 1);
      });

      test('getPlantedCounts', assert => {
        assert.is(controller.getPlantedCounts(), 0);

        // when 
        controller.store.set({ vegetables: [{ id: 1, planted: true }] });

        // then
        assert.is(controller.getPlantedCounts(), 1);
      });
    });

  }());

  // Generated file

  (function () {

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

    /**
     * Appends 'P' element to given output element.
     * 
     * @param {HTMLInputElement} $input element to get input from
     * @param {HTMLElement} $output element to append input to
     */
    const appendInput = ($input, $output) => _ => {
      const $element = createDomElement('p', {}, $input.value);
      $output.append($element);
      return $element; // return for testing purposes
    };

    /**
     * Changes the label of the given button
     * 
     * @param {HTMLButtonElement} $button to change label
     */
    const changeLabel = $button => event => {
      $button.textContent = 'Save: ' + event.target.value;
    };

    describe('Examples - DOM API', test => {
      test('appendInput', assert => {
        // given
        const $input = createDomElement('input', { value: 'Puerro' });
        const $output = createDomElement('div');

        // when
        const $element = appendInput($input, $output)(); // event object not needed

        // then
        assert.is($output.children.length, 1);
        assert.is($element.tagName, 'P');
        assert.is($element.textContent, 'Puerro');
      });

      test('changeLabel', assert => {
        // given
        const $input = createDomElement('input', { value: 'Puerro' });
        const $button = createDomElement('button', { type: 'button' });

        // when
        changeLabel($button)({ target: $input }); // mocking event object

        // then
        assert.is($button.textContent, 'Save: Puerro');
      });
    });

  }());

  (function () {

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

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an Observable
     * @param {any} item
     */
    const Observable = item => {
      const listeners = [];
      return {
        get: () => item,
        set: newItem => {
          if (item === newItem) return;
          const oldItem = item;
          item = newItem;
          listeners.forEach(notify => notify(newItem, oldItem));
        },
        onChange: callback => {
          listeners.push(callback);
          callback(item, item);
        },
      };
    };

    /**
     * Creates an Observable list
     * @param {any[]} list
     */
    const ObservableList = list => {
      const addListeners     = [];
      const removeListeners  = [];
      const replaceListeners = [];
      return {
        onAdd:     listener => addListeners    .push(listener),
        onRemove:  listener => removeListeners .push(listener),
        onReplace: listener => replaceListeners.push(listener),
        add: item => {
          list.push(item);
          addListeners.forEach(listener => listener(item));
        },
        remove: item => {
          const i = list.indexOf(item);
          if (i >= 0) {
            list.splice(i, 1);
          } // essentially "remove(item)"
          removeListeners.forEach(listener => listener(item));
        },
        replace: (item, newItem) => {
          const i = list.indexOf(item);
          if (i >= 0) {
            list[i] = newItem;
          }
          replaceListeners.forEach(listener => listener(newItem, item));
        },
        count:   ()    => list.length,
        countIf: pred  => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
        indexOf: item  => list.indexOf(item),
        get:     index => list[index],
        getAll:  ()    => list,
      };
    };

    /**
     * Creates a model
     * 
     * @param {object} state to be observable
     */
    const Model = ({ name = '', age = 0, errors = [] } = {}) => ({
      name: Observable(name),
      age: Observable(age),
      errors: ObservableList(errors)
    });

    /**
     * Creates a new controller
     * 
     * @param {object} model 
     */
    const Controller = model => {

      /**
       * Sets the name
       * 
       * @param {string} name 
       */
      const setName = name => {
        if (null == name || name.length === 0) {
          return alert('the name is required!');
        }
        model.name.set(name);
      };

      /**
       * Sets the age
       * 
       * @param {number} age 
       */
      const setAge = age => {
        model.age.set(age);
      };

      /**
       * Increases Age
       */
      const increaseAge = () => setAge(model.age.get() + 1);

      /**
       * Decreases Age
       */
      const decreaseAge = () => setAge(model.age.get() - 1);

      return {
        setName,
        increaseAge,
        decreaseAge,
      }
    };

    describe('Examples - MVC with Observables', test => {

      // before
      const model = Model();
      const controller = Controller(model);

      test('interact with controller', assert => {
        // inital
        assert.is(model.name.get(), '');
        assert.is(model.age.get(),   0);

        // when
        controller.setName('Puerro');
        controller.increaseAge();

        // then
        assert.is(model.name.get(), 'Puerro');
        assert.is(model.age.get(),   1);

        // when
        controller.setName('Huerto');
        controller.decreaseAge();

        // then
        assert.is(model.name.get(), 'Huerto');
        assert.is(model.age.get(),   0);
      });
    });

  }());

  (function () {

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

    /**
     * Observable Pattern Implementations
     *
     * @module observable
     */

    /**
     * Creates an object on which each property is observable
     * @param {any} object
     */
    const ObservableObject = object => {
      const listeners   = [];
      const subscribers = {};

      const notify = newObject => {
        if (object == newObject) return;
        const oldObject = object;
        object = newObject;

        Object.keys(newObject).forEach(key => {
          const newValue = newObject[key];
          const oldValue = oldObject[key];
          if (oldValue === newValue) return;
          (subscribers[key] || []).forEach(subscriber => subscriber(newValue, oldValue));
        });
        listeners.forEach(listener => listener(newObject, oldObject));
      };

      return {
        get:       ()              => object,
        set:       newObject       => notify({ ...object, ...newObject }),
        push:      (key, value)    => notify({ ...object, ...{ [key]: value } }),
        remove:    key             => notify({ ...object, ...{ [key]: undefined } }),
        replace:   newObject       => {
          const emptyObject = Object.assign({}, object);
          Object.keys(emptyObject).forEach(key => emptyObject[key] = undefined);
          notify({ ...emptyObject, ...newObject});
        },
        onChange:  callback        => { listeners.push(callback); callback(object, object); },
        subscribe: (key, callback) => {
          subscribers[key] = subscribers[key] || [];
          subscribers[key].push(callback);
          callback(object[key], object[key]);
        },
        // unsubscribe, removeOnChange
      };
    };

    /**
     * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
     */

    /**
     * Global store object
     */
    const store = ObservableObject({});

    /**
     * Abstract controller to use a MVC approach using the virtual DOM as a renderer.
     */
    class PuerroController {

      /**
       * Creating a new PuerroController
       * 
       * @param {HTMLElement} $root DOM element to mount view
       * @param {object} state initial state
       * @param {function(controller): VNode} view Virtual DOM creator
       * @param {boolean} diffing if diffing should be used
       */
      constructor($root, state, view, diffing = true) {
        this.$root = $root;
        this.state = ObservableObject({ ...state });
        this.view = view;
        this.diffing = diffing;
        this.vDom = null;
        this.init();
        this.onInit();
      }

      /**
       * Initial function of the Puerro Controller
       */
      init() {
        this.vDom = this.view(this);
        this.$root.prepend(render(this.vDom));
        this.store.onChange(s => this.refresh());
        this.state.onChange(s => this.refresh());
      }

      /**
       * On Init Hook 
       */
      onInit() {}

      /**
       * Refreshs the view
       */
      refresh() {
        const newVDom = this.view(this);
        this.repaint(newVDom);
        this.vDom = newVDom;
      }

      /**
       * Repaint the virtual DOM using the DOM API
       * 
       * @param {VNode} newVDom vDom to be paintend
       */
      repaint(newVDom) {
        if (this.diffing) {
          diff(this.$root, newVDom, this.vDom);
        } else {
          this.$root.replaceChild(render(newVDom), this.$root.firstChild);
        }
      }

      /**
       * Returns the model (store and state)
       */
      get model() {
        return { ...store.get(), ...this.state.get() };
      }

      /**
       * Returns the store
       */
      get store() { return store; }

      /**
       * Static method for returning the store
       */
      static get store() { return store; }
    }

    /**
     * Create a new CounterController
     */
    class CounterController extends PuerroController {

      /**
       * Increment the counter
       */
      increment() {
        this.state.set({counter: this.model.counter + 1});
      }

      /**
       * Decrement the counter
       */
      decrement() {
        this.state.set({counter: this.model.counter - 1});
      }
    }

    describe('Examples - MVC with virtual DOM', test => {

      // before
      const $root = createDomElement('div');
      const model = { counter: 0 };
      const view = x => h(); // not important for testing the logic
      const controller = new CounterController($root, model, view);

      test('using counter', assert => {
        // inital
        assert.is(controller.model.counter, 0);

        // when
        controller.increment();

        // then
        assert.is(controller.model.counter, 1);

        // when
        controller.decrement();

        // then
        assert.is(controller.model.counter, 0);
      });
    });

  }());

  (function () {

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
     * Converts a DOM Node to a Virtual Node
     *
     * @param {HTMLElement} $node
     *
     * @returns {VNode}
     */
    const toVDOM = $node => {
      const tagName = $node.tagName;
      const $children = $node.children;

      const attributes = Object.values($node.attributes).reduce((attributes, attribute) => {
        attributes[attribute.name] = attribute.value;
        return attributes;
      }, {});

      if ($children.length > 0) {
        return vNode(tagName, attributes, Array.from($children).map(toVDOM));
      }

      return vNode(tagName, attributes, $node.textContent);
    };

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

    /**
     * Creates the virtual DOM based on the given items
     * 
     * @param {Array} items to create the vdom with
     */
    const createVDOM = items => h('tbody', {}, 
      items.map(item =>  h('tr', { class: 'row' }, h('td', { class: 'item' }, item)))
    ); 

    /**
     * Handles the button click
     * 
     * @param {HTMLTableElement} $table 
     */
    const handleClick = $table => _ => {
      const items = ['Puerro', 'Huerto']; // items could be fetched from API's, DOM elements or others
      const vDOM = createVDOM(items);
      diff($table, vDOM, toVDOM($table.firstElementChild));
      return vDOM;
    };

    describe('Examples - virtual DOM', test => {
      test('createVDOM', assert => {
        // given
        const items = ['Puerro', 'Huerto'];

        // when
        const vDOM = createVDOM(items);

        // then
        assert.is(vDOM.children.length, 2);
        assert.is(render(vDOM).querySelector('td').textContent, 'Puerro'); // possibility to interact via DOM API
      });

      test('handleClick', assert => {
        // given
        const $table  = render(createVDOM(['Puerro']));

        // when
        handleClick($table)();

        // then
        assert.is($table.querySelector('td').textContent, 'Puerro');
      });
    });

  }());

  (function () {

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

    /**
     * Creates a view with the given state interface
     * 
     * @param {object} object used for state managemend 
     */
    const view = ({ state, setState }) =>
      h('div', { },
        h('input', {
          type:  'number',
          name:  'num1',
          input: evt => setState({ num1: +evt.target.value })
        }),
        h('span', {}, '+'),
        h('input', {
          type:  'number',
          name:  'num2',
          input: evt => setState({ num2: +evt.target.value })
        }),
        h('span', { }, '= ' + (state.num1+state.num2)),
      );

    describe('Examples - State Management with virtual DOM', test => {
      test('sum numbers', assert => {
        // given
        const setState = () => {};
        const state = {
          num1: 2,
          num2: 3
        };

        // when
        const vDOM = view({ state, setState });

        // then
        assert.is(vDOM.children[vDOM.children.length - 1].children[0], '= 5');
      });
    });

  }());

  (function () {

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

    /**
     * Abstract class which provides state to custom HTML elements.
     */
    class PuerroElement extends HTMLElement {
      /**
       * Creates a new Puerro Element
       * 
       * @param {Object} initialState initial state
       */
      constructor(initialState = {}) {
        super();
        this.state = initialState;
      }

      /**
       * Connected Callback
       */
      connectedCallback() {
        this.refresh();
      }

      /**
       * Sets a new state based on a given object or function
       *
       * @param {object | Function} newState
       */
      setState(newState) {
        if (typeof newState === 'function') {
          this.state = { ...this.state, ...newState(state) };
        } else {
          this.state = { ...this.state, ...newState };
        }
        this.refresh();
      }

      /**
       * Refreshes the Dom
       */
      refresh() {
        const newVNode = this.render();
        if (null == this.vNode) {
          this.prepend(render(this.render()));
        } else {
          diff(this, newVNode, this.vNode);
        }
        this.vNode = newVNode;
      }

      /**
       * Render function
       * @abstract
       */
      render() { }
    }

    /**
     * Create a new PuerroInput Component
     */
    class PuerroInputComponent extends PuerroElement {
      /**
       * Returns the selector of the element
       */
      static get Selector() { return 'puerro-input' };

      /**
       * Returns the label
       */
      get label() {
        return this.hasAttribute('label') && this.getAttribute('label');
      }

      /**
       * Sets the label
       * @param value label to be set
       */
      set label(value) {
        if (null == value) {
          this.removeAttribute('label');
        } else {
          this.setAttribute('label');
          this.refresh();
        }
      }

      /**
       * Dispatches the value changed event.
       * @param {Event} evt 
       */
      _onInput(evt) {
        this.dispatchEvent(new CustomEvent('valueChanged', { detail: evt.target.value }));
      }

      /**
       * Renders the view
       * 
       * @override
       */
      render() {
        return h('input', {
          type: 'number',
          name: 'name',
          placeholder: this.label,
          input: evt => this._onInput(evt)
        })
      }
    }

    /**
     * Creats a new Main Component
     */
    class MainComponent extends PuerroElement {
      /**
      * Returns the selector of the element
      */
      static get Selector() { return 'puerro-main' };

      /**
       * Sets the initail state
       */
      constructor() {
        super({ num1: 0, num2: 0 });
      }

      /**
       * Renders the view
       * 
       * @override
       */
      render() {
        return h('div', {},
          h(PuerroInputComponent.Selector, { label: 'num1', valueChanged: evt => this.setState({ num1: +evt.detail }) }),
          h('span', {}, '+'),
          h(PuerroInputComponent.Selector, { label: 'num2', valueChanged: evt => this.setState({ num2: +evt.detail }) }),
          h('span', {}, '= ' + (this.state.num1 + this.state.num2)),
        )
      }
    }

    describe('Examples - State Management with Web-Components', test => {
      window.customElements.define(PuerroInputComponent.Selector, PuerroInputComponent);
      window.customElements.define(MainComponent.Selector, MainComponent);

      test('PuerroInputComponent label', assert => {
        // given
        const $puerroComponent = createDomElement(PuerroInputComponent.Selector, { label: 'Test' });

        // when
        document.body.appendChild($puerroComponent);

        // then
        assert.is($puerroComponent.getAttribute('label'), 'Test');
        assert.is($puerroComponent.getElementsByTagName('input')[0].getAttribute('placeholder'), 'Test');

        // cleanup
        document.body.removeChild($puerroComponent);
      });

      test('PuerroInputComponent valueChanged', assert => {
        // given
        const onValueChanged = evt => assert.is(+evt.detail, 3);
        const $puerroComponent = createDomElement(PuerroInputComponent.Selector, { valueChanged: onValueChanged });
        const event = new Event('input');

        // when
        document.body.appendChild($puerroComponent);
        const $input = $puerroComponent.getElementsByTagName('input')[0];
        $input.value = 3;
        $input.dispatchEvent(event);

        // cleanup
        document.body.removeChild($puerroComponent);
      });
    });

  }());

  // Generated file

  // Generated file

}());
