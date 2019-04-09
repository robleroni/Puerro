(function () {
  'use strict';

  /**
   * Creates a new HTMLElement
   * @param {string} tagName
   *
   * @returns {function(content): HTMLElement}
   */
  const createElement = (tagName, attributes = {}) => content => {
    const $element = document.createElement(tagName);
    if (content) {
      $element.innerHTML = content;
    }
    Object.keys(attributes)
      .filter(key => null != attributes[key]) // don't render attributes with value null/undefined
      .forEach(key => {
        if (typeof attributes[key] === 'function') {
          $element.addEventListener(key, attributes[key]);
        } else {
          $element.setAttribute(key, attributes[key]);
        }
      });
    return $element;
  };

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
        .map(createElement('li'))
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

}());
