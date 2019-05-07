import { Controller } from '../../../puerro/mvc/controller.js';
import { formModel } from '../models/form.js';

export {
  ListController
}

class ListController extends Controller {
  constructor($root, model, view, diffing = true) {
    super($root, model, view, diffing);
    this.id = 0;
  }

  nextId() {
    return ++this.id;
  }

  addVegetable() {
    const vegetable = { ...formModel, id: this.nextId() };
    this.store.set({
      vegetables: [...this.model.vegetables, vegetable],
    });
    this.selectVegetable(vegetable);
  }

  selectVegetable(vegetable) {
    this.state.set({ selected: vegetable })
  }

}