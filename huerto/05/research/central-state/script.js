import { mount } from './vdom-research';

const initialState = {
  todos: []
}

const actions = {
  addTodo: todo => state => ({ ...state, todos: [...state.todos, todo] })
}

const counter = ({ state, setState })=> h => 
  h('span', {}, `Count of todos: ${state.todos.length}`);

const form = ({ state, setState }) => h => 
  h('form', { submit: e => { e.preventDefault(); setState(actions.addTodo(e.target.todo.value)); } }, 
    h('input', { name: 'todo', required: true }),
    h('button', { type: 'submit'}, 'submit')
  );

const list = ({ state, setState }) => h => 
  h('ul', {}, state.todos.map(t => h('li', {}, t)));

const view = ({ state, setState }) => h => {
  return h('main', {}, 
    h(form),
    h(list),
    h(counter),
  );
}

mount(document.body, view, initialState);