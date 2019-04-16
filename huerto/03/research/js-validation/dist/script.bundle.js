(function () {
  'use strict';

  /**
   * A Module that abstracts Virtual DOM interactions.
   * It's purpose is to perform actions on DOM-like Objects
   *
   * @module vdom
   */

  /**
   * A Module that abstracts DOM interactions.
   * It's purpose is to perform actions on the DOM like creating and mounting elements
   *
   * @module dom
   */

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
        $el.parentNode.append(
          createElement('span', { style: 'color: red' })('This field is required')
        );
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

  Huerto(document.getElementById('vegetableForm'), document.getElementById('vegetables'));

}());
