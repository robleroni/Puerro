import { Observable } from '../../../../puerro/observable/observable';

export {
  Controller,
  FormView,
  OutputView
}

const Model = () => {
  const nameAttr = Observable('');
  return {
    nameAttr
  }
}

const Controller = () => {
  const model = Model();
  return {
    onNameChange: model.nameAttr.onChange,
    getName: model.nameAttr.get,
    setName: model.nameAttr.set
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
