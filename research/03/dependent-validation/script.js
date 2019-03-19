import { h, createView } from "../../../puerro/src/util/dom";

const $form = document.querySelector('form');

const onChange = $form => event => {
  if (new Date($form.from.value) >= new Date($form.to.value)) {
    $form.from.setCustomValidity('From-date has to be earlier than to-date!');
  } else {
    $form.from.setCustomValidity('');
  }
}

const view = () => {
  return h('div', {}, [
    h('input', { input: onChange($form), name: 'from', type: 'date', required: true }),
    h('input', { input: onChange($form), name: 'to', type: 'date', required: true }),
    h('button', {}, 'Submit')
  ]);
}

createView($form, view);