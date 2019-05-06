import { Controller } from '../../../puerro/mvc/controller.js';

export { FormController };

class FormController extends Controller {
  constructor($root, model, view, diffing = true) {
    super($root, model, view, diffing);
  }

  setVegetable(vegetable) {
    this.refresh({ ...this.model, ...vegetable });
  }

  save() {
    this.setGlobalState({
      vegetables: this.globalState.vegetables.map(v => v.id === this.model.id ? this.model : v)
    })
  }

}
