import { h } from '../../../../puerro/util/vdom';
import { mount } from '../../../../puerro/util/dom';

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

const view = (getState, setState) => {
  const v = h('div', {}, [
    h('input', {
      input: onChange(setState),
      name: 'from',
      type: 'date',
      required: true,
      value: getState()
        .from.toISOString()
        .substr(0, 10),
    }),
    h('input', {
      input: onChange(setState),
      name: 'to',
      type: 'date',
      required: true,
      value: getState()
        .to.toISOString()
        .substr(0, 10),
    }),
    h('p', {}, `${getState().from.toISOString()} - ${getState().to.toISOString()}`),
    h('button', {}, 'Submit'),
  ]);
  console.log(v);
  return v;
};

mount($form, view, initialState);
