import { createDomElement } from '../../../../src/vdom/vdom';

function Huerto($form, $vegetables) {
  const vegetables = [];
  const $name = $form.querySelector('input[name="name"]'),
    $amount = $form.querySelector('input[name="amount"]'),
    $submit = $form.querySelector('button[type="submit"]');

  function setDisabled() {
    if ($form.checkValidity()) {
      $submit.removeAttribute('disabled');
    } else {
      $submit.setAttribute('disabled', true);
    }
  }

  function onFormSubmit(event) {
    event.preventDefault();
    vegetables.push({ name: $name.value, amount: $amount.value });
    $form.reset();
    setDisabled();
    renderVegetables();
  }

  function renderVegetables() {
    vegetables
      .map(v => `${v.amount}x ${v.name}`)
      .map(createDomElement('li'))
      .forEach(v => $vegetables.appendChild(v));
  }

  function bindEvents() {
    $name.addEventListener('input', setDisabled);
    $amount.addEventListener('input', setDisabled);
    $form.addEventListener('submit', onFormSubmit);
  }

  bindEvents();
}

Huerto(document.getElementById('vegetableForm'), document.getElementById('vegetables'));
