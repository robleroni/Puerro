import { PreactController, Controller } from '../../../puerro/mvc/controller.js';
import { formModel } from '../models/form.js';

export {
  ListController
}

class ListController extends PreactController {

  onInit() {
    this.id = 0;
    Controller.store.subscribe('vegetables', (vegetables, oldVegetables) => {
      const selectedId = this.state.get().selected.id;
      const index      = oldVegetables.indexOf(oldVegetables.find(v => v.id === selectedId))
      
      let vegetable = vegetables[index];
      if(vegetable) {
        this.selectVegetable(vegetable)
        return
      }
      
      vegetable = vegetables[index-1];
      if(vegetable) {
        this.selectVegetable(vegetable)
        return
      }
      
      this.selectVegetable(formModel)
      
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