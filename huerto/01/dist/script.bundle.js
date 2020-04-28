(function () {
  'use strict';

  const ENTER_KEYCODE = 13;

  /**
   * Registers the event for adding a vegetable
   *
   * @param {HTMLInputElement} $vegetableInput - Input element to add new vegetables
   * @param {HTMLElement} $vegetablesOutput    - Container for the vegetables
   */
  function registerAddingVegetableEvent($vegetableInput, $vegetablesOutput) {
    $vegetableInput.addEventListener('keydown', event => {
      if (event.keyCode === ENTER_KEYCODE) {
        const $vegetable = document.createElement('li');
        $vegetable.textContent = $vegetableInput.value;
        $vegetablesOutput.appendChild($vegetable);
        $vegetableInput.value = '';
      }
    });
  }

  registerAddingVegetableEvent(
    document.getElementById('vegetable'),
    document.getElementById('vegetables')
  );

}());
