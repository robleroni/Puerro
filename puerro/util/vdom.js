export { h, changed, toVNode };
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
