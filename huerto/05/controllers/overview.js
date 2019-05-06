import { Controller } from '../../../puerro/mvc/controller.js';

export { OverviewController };

class OverviewController extends Controller {
  constructor($root, model, view, diffing = true) {
    super($root, model, view, diffing);
  }

  getPlantedCounts() {
    return this.globalState.vegetables.filter(v => v.planted).length
  }
}
