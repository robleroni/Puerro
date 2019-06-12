(function () {
  'use strict';

  /**
   * A Module that abstracts Virtual DOM interactions.
   * It's purpose is to perform actions on DOM-like Objects
   *
   * @module vdom
   */

  /**
   * @typedef {{ tagName: string, attributes: object, children: any  }} VNode
   */

  /**
  * Creates a new HTML Element.
  * If the attribute is a function it will add it as an EventListener.
  * Otherwise as an attribute.
  *
  * @param {string} tagName name of the tag
  * @param {object} attributes attributes or listeners to set in element
  * @param {*} innerHTML content of the tag
  *
  * @returns {HTMLElement}
  */
  const createDomElement = (tagName, attributes = {}, innerHTML = '') => {
    const $element = document.createElement(tagName);
    $element.innerHTML = innerHTML;
    Object.keys(attributes)
      .filter(key => null != attributes[key]) // don't create attributes with value null/undefined
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
          createDomElement('span', { style: 'color: red' }, 'This field is required')
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
        .map(createDomElement('li'))
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
