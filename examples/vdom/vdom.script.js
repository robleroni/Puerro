import { h, render, diff } from '../../src/vdom/vdom';

const view = (greeting, name) => h('h1', {},
  h('span', {}, greeting),
  h('span', {}, ' '),
  h('span', {}, name)
);

const initialView = view('Hello', 'User');
document.body.prepend(render(initialView));

setTimeout(() => {
  diff(document.body, view('Goodbye', 'User'), initialView);
}, 2000);