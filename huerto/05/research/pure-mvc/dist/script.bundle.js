(function () {
  'use strict';

  /**
   * Observable Pattern Implementation
   *
   * @module observable
   */

  const Observable = item => {
    const listeners = [];
    return {
      get: () => item,
      set: newItem => {
        if (item === newItem) return;
        const oldItem = item;
        item = newItem;
        listeners.forEach(notify => notify(newItem, oldItem));
      },
      onChange: callback => {
        listeners.push(callback);
        callback(item, item);
      },
    };
  };

  const Model = () => {
    const nameAttr = Observable('');
    return {
      nameAttr
    }
  };

  const Controller = () => {
    const model = Model();
    return {
      onNameChange: model.nameAttr.onChange,
      getName: model.nameAttr.get,
      setName: model.nameAttr.set
    }
  };

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

  const controller = Controller();
  const $form = document.getElementById('form');
  const $output = document.getElementById('output');

  FormView(controller, $form);
  OutputView(controller, $output);

}());
