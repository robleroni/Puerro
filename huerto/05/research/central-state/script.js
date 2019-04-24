import { h } from '../../../../puerro/util/vdom';
import { mount } from '../../../../puerro/util/dom';


const initialState = {
  todos: []
}

const actions = {
  addTodo: todo => state => ({ ...state, todos: [...state.todos, todo] })
}

const counter = ({ state, setState }) => 
  h('span', {}, `Count of todos: ${state.todos.length}`);

const form = ({ state, setState }) => 
  h('form', { submit: e => { e.preventDefault(); setState(actions.addTodo(e.target.todo.value)); } }, 
    h('input', { name: 'todo', required: true }),
    h('button', { type: 'submit'}, 'submit')
  );

const list = ({ state, setState }) => 
  h('ul', {}, state.todos.map(t => h('li', {}, t)));

const view = ({ state, setState }) => {
  return h('main', {}, 
    form({ state, setState }),
    list({ state, setState }),
    counter({ state, setState }),
  );
}

mount(document.body, view, initialState);