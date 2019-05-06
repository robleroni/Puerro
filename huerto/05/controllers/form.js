import { Controller } from '../../../puerro/mvc/controller.js';

export { FormController };

class FormController extends Controller {

  setVegetable(vegetable) {
    this.refresh({ ...this.model, ...vegetable });
  }

  save() {
    this.setGlobalState({
      vegetables: this.globalState.vegetables.map(v => v.id === this.model.id ? this.model : v)
    })
  }

}
