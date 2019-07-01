(function () {
  'use strict';

  /**
   * Observable Pattern Implementations
   *
   * @module observable
   */

  /**
   * Creates an Observable
   * @param {any} item
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

  /**
   * Creates an Observable list
   * @param {any[]} list
   */
  const ObservableList = list => {
    const addListeners     = [];
    const removeListeners  = [];
    const replaceListeners = [];
    return {
      onAdd:     listener => addListeners    .push(listener),
      onRemove:  listener => removeListeners .push(listener),
      onReplace: listener => replaceListeners.push(listener),
      add: item => {
        list.push(item);
        addListeners.forEach(listener => listener(item));
      },
      remove: item => {
        const i = list.indexOf(item);
        if (i >= 0) {
          list.splice(i, 1);
        } // essentially "remove(item)"
        removeListeners.forEach(listener => listener(item));
      },
      replace: (item, newItem) => {
        const i = list.indexOf(item);
        if (i >= 0) {
          list[i] = newItem;
        }
        replaceListeners.forEach(listener => listener(newItem, item));
      },
      count:   ()    => list.length,
      countIf: pred  => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
      indexOf: item  => list.indexOf(item),
      get:     index => list[index],
      getAll:  ()    => list,
    };
  };

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
  };

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
    };

    /**
     * Sets the age
     * 
     * @param {number} age 
     */
    const setAge = age => {
      model.age.set(age);
    };

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
  };

  const model = Model();
  const controller = Controller(model);
  const view = View(model,
    controller,
    document.getElementById('form'),
    document.getElementById('output')
  );

}());
