export { vNode, createNode, render };

const vNode = tag => (attributes = {}) => (...nodes) => ({
  tag,
  attributes,
  children: [].concat(...nodes), // collapse nested arrays.
});

const createNode = vNode => {
  if (typeof vNode === 'string' || typeof vNode === 'number') {
    return document.createTextNode(vNode);
  }

  let $node = document.createElement(vNode.tag);
  Object.keys(vNode.attributes).forEach(a =>
    $node.setAttribute(a, vNode.attributes[a])
  );

  vNode.children.forEach(c => $node.appendChild(createNode(c))); // append child nodes

  return $node;
};

const render = $root => vNode => $root.appendChild(createNode(vNode));

// Attempt to generate vElements.. but export doesn't work as expected
const tags = ['input', 'form', 'button'];
const vElements = tags.reduce((acc, tag) => {
  acc[tag] = vNode(tag);
  return acc;
}, {});
const input = vNode('input');
