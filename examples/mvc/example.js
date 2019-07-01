import { Observable, ObservableList } from "../../src/observable/observable";

export { Model, View, Controller }

/**
 * Creates a model
 * 
 * @param {object} state to be observable
 */
const Model = ({ name = '', age = 0, errors = [] } = {}) => ({
  name: Observable(name),
  age: Observable(age),
  errors: ObservableList(errors)
});

/**
 * Creates a view
 * 
 * @param {object} model the view uses to render
 * @param {any} controller api the view can use for interactions with the model
 * @param {HTMLFormElement} $form to attach event view bindings
 * @param {HTMLElement} $output to attach event view bindings
 */
const View = (model, controller, $form, $output) => {
  const render = () => ($output.innerText = `${model.name.get()} - ${model.age.get()}`);

  // View-Binding
  $form.name.addEventListener('input', evt => controller.setName(evt.target.value));

  $form.increase.addEventListener('click', controller.increaseAge);
  $form.decrease.addEventListener('click', controller.decreaseAge);

  // Model-Binding
  model.name.onChange(render);
  model.age.onChange(render);
}

/**
 * Creates a new controller
 * 
 * @param {object} model 
 */
const Controller = model => {

  /**
   * Sets the name
   * 
   * @param {string} name 
   */
  const setName = name => {
    if (null == name || name.length === 0) {
      return alert('the name is required!');
    }
    model.name.set(name);
  }

  /**
   * Sets the age
   * 
   * @param {number} age 
   */
  const setAge = age => {
    model.age.set(age);
  }

  /**
   * Increases Age
   */
  const increaseAge = () => setAge(model.age.get() + 1);

  /**
   * Decreases Age
   */
  const decreaseAge = () => setAge(model.age.get() - 1);

  return {
    setName,
    increaseAge,
    decreaseAge,
  }
}