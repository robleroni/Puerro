import { Controller } from '../../../puerro/mvc/controller.js';

export { FormController };

class FormController extends Controller {


  setVegetable(vegetable) {
    this.state.set(vegetable)
  }

  save() {
    this.store.set({
      vegetables: this.model.vegetables.map(v => v.id === this.model.id ? this.model : v)
    })
  }

}
