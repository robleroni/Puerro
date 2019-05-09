import { PreactController } from '../../../puerro/mvc/controller.js';
import { formModel } from '../models/form.js';

export { FormController };

class FormController extends PreactController {


  setVegetable(vegetable) {
    this.state.set(vegetable)
  }

  reset() {
    evt.preventDefault();
    this.setVegetable({ ...formModel, id: this.model.id });
  }

  save() {
    this.store.set({
      vegetables: this.store.get().vegetables.map(v => v.id === this.model.id ? this.model : v)
    })
  }

  delete() {
    this.store.set({
      vegetables: this.store.get().vegetables.filter(v => v.id !== this.model.id)
    });
    this.setVegetable({ ...formModel });
  }
}
