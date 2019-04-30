import { Controller } from '../../../puerro/mvc/controller.js';

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

  updateVegetable(vegetable) {
    const old = this.model.vegetables.find(v => v.id === vegetable.id);
    if (null == old) {
      this.refresh({
        vegetables: [...this.model.vegetables, { id: this.nextId(), ...vegetable }]
      });
    } else {
      this.refresh({
        vegetable: this.model.vegetables.map(v => v.id === vegetable.id ? vegetable : v)
      })
    }
  }
}