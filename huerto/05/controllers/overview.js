import { PreactController } from '../../../src/mvc/preact.controller.js';

export { OverviewController };

class OverviewController extends PreactController {

  getPlantedCounts() {
    return this.store.get().vegetables.filter(v => v.planted).length
  }
}
