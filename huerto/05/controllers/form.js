import { Controller } from '../../../puerro/mvc/controller.js';

export { FormController };

class FormController extends Controller {
  constructor($root, model, view, diffing = true) {
    super($root, model, view, diffing);
    this.saveListeners = [];
  }

  addSaveListener(listener) {
    this.saveListeners.push(listener);
  }

  setVegetable(vegetable) {
    this.refresh({ ...vegetable });
  }

  setName(name) {
    this.refresh({ name });
  }
  setClassification(classification) {
    this.refresh({ classification });
  }
  setOrigin(origin) {
    this.refresh({ origin });
  }
  setAmount(amount) {
    this.refresh({ amount });
  }
  setComment(comment) {
    this.refresh({ comment });
  }

  save() {
    this.saveListeners.forEach(listener => listener(this.model));
  }
}
