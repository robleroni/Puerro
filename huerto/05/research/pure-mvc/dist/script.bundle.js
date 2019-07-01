(function () {
  'use strict';

  /**
   * Observable Pattern Implementations
   *
   * @module observable
   */

  /**
   *
   * @param {*} controller
   * @param {HTMLFormElement} $form
   */
  const FormView = (controller, $form) => {
    // View-Binding
    $form.name.addEventListener('input', evt => {
      controller.setName(evt.target.value);
    });
  };
  /**
   *
   * @param {*} controller
   * @param {HTMLElement} $output
   */
  const OutputView = (controller, $output) => {
    // Render
    const render = () => $output.innerText = controller.getName();

    // Data-Binding
    controller.onNameChange(render);
  };

  /**
   *
   * @param {*} controller
   * @param {HTMLElement} $error
   */
  const ErrorView = (controller, $error) => {
    // Render
    const render = () => {
      $error.innerText = controller.getError();
      if (controller.getError() && $error.classList.contains('hidden')) {
        $error.classList.remove('hidden');
      }
      if (!controller.getError() && !$error.classList.contains('hidden')) {
        $error.classList.add('hidden');
      }
    };

    controller.onErrorChange(render);
  };

  const controller = Controller();
  const $form      = document.getElementById('form');
  const $output    = document.getElementById('output');
  const $error     = document.getElementById('error');

  FormView(controller, $form);
  OutputView(controller, $output);
  ErrorView(controller, $error);

}());
