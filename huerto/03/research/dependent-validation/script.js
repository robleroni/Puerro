import { h, mount } from '../../../../puerro/src/util/dom';

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

const view = (state, setState) => {
  return h('div', {}, [
    h('input', {
      input: onChange(setState),
      name: 'from',
      type: 'date',
      required: true,
      value: state.from.toISOString().substr(0, 10),
    }),
    h('input', {
      input: onChange(setState),
      name: 'to',
      type: 'date',
      required: true,
      value: state.to.toISOString().substr(0, 10),
    }),
    h('p', {}, `${state.from.toISOString()} - ${state.to.toISOString()}`),
    h('button', {}, 'Submit'),
  ]);
};

mount($form, view, initialState);
