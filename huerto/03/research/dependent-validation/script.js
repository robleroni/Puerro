import { h, mount } from '../../../../src/vdom/vdom';
import htm from './htm';

const html = htm.bind(h);

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
