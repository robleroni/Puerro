export { h, changed };
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
const h = (tagName, attributes = {}, ...nodes) => ({
  tagName,
  attributes,
  children: [].concat(...nodes), // collapse nested arrays.
});

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
          (null == node1.attributes[a] ? '' : node1.attributes[a]).toString()
            !== (null == node2.attributes[a] ? '' : node2.attributes[a]).toString()
      ));
  return nodeChanged || attributesChanged;
};
