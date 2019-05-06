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
    this.setGlobalState({
      vegetables: [...this.globalState.vegetables, vegetable],
    });
    this.selectVegetable(vegetable);
  }

  selectVegetable(vegetable) {
    this.refresh({ selected: vegetable });
    this.eventManager.publish('selectionChanged', vegetable)
  }

}