import { Observable } from '../../../../src/observable/observable';

export {
  Controller,
  FormView,
  OutputView,
  ErrorView
}

const Model = () => {
  const nameAttr = Observable('');
  const errorAttr = Observable('');
  return {
    nameAttr,
    errorAttr,
  }
}

const Controller = () => {
  const model = Model();

  function setName(name) {
    if(!name && !model.errorAttr.get()) {
      model.errorAttr.set('Name is required!');
    }
    if (name && model.errorAttr.get()) {
      model.errorAttr.set('');
    }
    model.nameAttr.set(name);
  }

  return {
    onNameChange: model.nameAttr.onChange,
    onErrorChange: model.errorAttr.onChange,
    getName: model.nameAttr.get,
    getError: model.errorAttr.get,
    setName,
  }
}

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
}
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
}

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
  }

  controller.onErrorChange(render);
}
