import { Observable, ObservableList } from "../../src/observable/observable";

export {
  Model, View, Controller
}

const Model = ({ name = '', age = 0, errors = [] } = {}) => ({
  name: Observable(name),
  age: Observable(age),
  errors: ObservableList(errors)
});

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

const Controller = model => {
  const setName = name => {
    if (null == name || name.length === 0) {
      return alert('the name is required!');
    }
    model.name.set(name);
  }

  const setAge = age => {
    model.age.set(age);
  }

  const increaseAge = () => setAge(model.age.get() + 1);
  const decreaseAge = () => setAge(model.age.get() - 1);

  return {
    setName,
    increaseAge,
    decreaseAge,
  }
}