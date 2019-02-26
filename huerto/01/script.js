const Huerto = (() => {
  const vegetables = [];
  const $vegetable = document.getElementById('vegetable'),
    $vegetables = document.getElementById('vegetables');

  function bindEvents() {
    $vegetable.addEventListener('keydown', e => {
      if (e.keyCode === 13) {
        addVegetable($vegetable.value);
        $vegetable.value = '';
        $vegetables.innerHTML = renderVegetables();
      }
    });
  }

  function addVegetable(vegetable) {
    vegetables.push(vegetable);
  }

  function renderVegetables() {
    return vegetables.map(v => `<li>${v}</li>`).join('');
  }

  if ($vegetables && $vegetable) {
    bindEvents();
  }

  return {
    addVegetable,
    renderVegetables,
  }
})();
