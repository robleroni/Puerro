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

  addVegetable(vegetable = formModel) {
    const v = { ...vegetable, id: this.nextId() };
    this.refresh({
      vegetables: [...this.model.vegetables, v],
    });
    this.selectVegetable(v);
  }

  selectVegetable(vegetable) {
    this.refresh({ selected: vegetable });
    this.eventManager.publish('selectionChanged', vegetable)
  }

  updateVegetable(vegetable) {
    const old = this.model.vegetables.find(v => v.id === vegetable.id);
    if (null == old) {
      this.addVegetable();
    } else {
      this.refresh({
        vegetables: this.model.vegetables.map(v => v.id === vegetable.id ? vegetable : v)
      })
    }
  }
}