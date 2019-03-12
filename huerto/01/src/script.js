export const ENTER_KEYCODE = 13;

/**
 * Constructor function to create the Huerto UI
 *
 * @param {HTMLInputElement} $vegetable - Input element to add new vegetables
 * @param {HTMLElement} $vegetables - Container for the vegetables
 */
export function Huerto($vegetable, $vegetables) {
  const vegetables = [];

  function bindEvents() {
    $vegetable.addEventListener('keydown', e => {
      if (e.keyCode === ENTER_KEYCODE) {
        vegetables.push($vegetable.value);
        $vegetable.value = '';
        renderVegetables();
      }
    });
  }

  function renderVegetables() {
    return ($vegetables.innerHTML = vegetables
      .map(v => `<li>${v}</li>`)
      .join(''));
  }

  bindEvents();
}
