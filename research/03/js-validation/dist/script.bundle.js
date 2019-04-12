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
    $element.innerHTML = content;
    Object.keys(attributes).forEach(attribute => {
      $element.setAttribute(attribute, attributes[attribute]);
    });
    return $element;
  };

  /**
   *
   * @param {HTMLFormElement} $form
   * @param {HTMLElement} $vegetables
   */
  function Huerto($form, $vegetables) {
    const vegetables = [];
    const $name = $form.name,
          $amount = $form.amount,
          $submit = $form.querySelector('button[type="submit"]');

    function setDisabled() {
      if ($name.value && $amount.value) {
        $submit.removeAttribute('disabled');
      } else {
        $submit.setAttribute('disabled', true);
      }
    }

    function onInput(event) {
      setDisabled();
      const $el = event.target;
      if (!$el.value && !$el.nextSibling) {
        $el.parentNode.append(createElement('span', { style: 'color: red' })('This field is required'));
      }

      if ($el.value && $el.nextSibling) {
        $el.nextSibling.remove();
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
      $name.addEventListener('input', onInput);
      $amount.addEventListener('input', onInput);
      $form.addEventListener('submit', onFormSubmit);
    }

    bindEvents();
  }

  Huerto(
    document.getElementById('vegetableForm'),
    document.getElementById('vegetables')
  );

}());
