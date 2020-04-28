import { PreactController } from '../../../src/mvc/preact.controller.js';
import { formModel } from '../models/form.js';

export { FormController };

class FormController extends PreactController {

  setVegetable(vegetable) {
    this.state.set(vegetable);
  }

  reset() {
    this.setVegetable({ ...formModel, id: this.model.id });
  }

  save() {
    const updatedVegetables = this.store.get().vegetables.map(v => (v.id === this.model.id ? this.state.get() : v))
    this.store.push('vegetables', updatedVegetables);
  }

  delete() {
    this.store.push('vegetables', this.store.get().vegetables.filter(v => v.id !== this.model.id));
  }
}
