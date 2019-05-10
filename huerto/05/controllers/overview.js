import { PreactController } from '../../../puerro/mvc/controller.js';

export { OverviewController };

class OverviewController extends PreactController {
  constructor($root, model, view, diffing = true) {
    super($root, model, view, diffing);
  }

  getPlantedCounts() {
    return this.model.vegetables.filter(v => v.planted).length
  }
}