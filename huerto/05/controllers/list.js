import { PreactController } from '../../../src/mvc/preact.controller.js';
import { formModel } from '../models/form.js';

export {
  ListController
}

class ListController extends PreactController {

  onInit() {
    this.id = 0;
    this.store.subscribe('vegetables', (vegetables, oldVegetables) => {
      const selectedId = this.state.get().selected.id;
      const index      = oldVegetables.indexOf(oldVegetables.find(v => v.id === selectedId))

      let vegetable = vegetables[index] || vegetables[index-1] || formModel;
      this.selectVegetable(vegetable)
      //TODO: Consider ObservableList for vegetables in store?
    })
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