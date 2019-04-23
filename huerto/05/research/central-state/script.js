import { h } from '../../../../puerro/util/vdom';
import { mountWithActions } from '../../../../puerro/util/dom';


const initialState = {
  todos: []
}

const actions = {
  addTodo: todo => state => ({ ...state, todos: [...state.todos, todo] })
}

const counter = ({state, act}) => 
  h('span', {}, `Count of todos: ${state.todos.length}`);

const form = ({state, act}) => 
  h('form', { submit: e => { e.preventDefault(); act(actions.addTodo(e.target.todo.value)); } }, 
    h('input', { name: 'todo', required: true }),
    h('button', { type: 'submit'}, 'submit')
  );

const list = ({state, act}) => 
  h('ul', {}, state.todos.map(t => h('li', {}, t)));

const view = ({state, act}) => {
  return h('main', {}, 
    form({state, act}),
    list({state, act}),
    counter({state, act}),
  );
}

mountWithActions(document.body, view, initialState);