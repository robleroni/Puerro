export { ENTER_KEYCODE, Huerto };

const ENTER_KEYCODE = 13;

/**
 * Constructor function to create the Huerto UI
 *
 * @param {HTMLInputElement} $vegetableInput - Input element to add new vegetables
 * @param {HTMLElement} $vegetables - Container for the vegetables
 */
function Huerto($vegetableInput, $vegetables) {
  $vegetableInput.addEventListener('keydown', event => {
    if (event.keyCode === ENTER_KEYCODE) {
      const $vegetable = document.createElement('li');
      $vegetable.textContent = $vegetableInput.value;
      $vegetables.appendChild($vegetable);
      $vegetableInput.value = '';
    }
  });
}
