import { Controller } from '../../../../../puerro/mvc/controller';

export { ResearchController };

class ResearchController extends Controller {
  addCount1(count) {
    this.refresh({ count1: this.model.count1 + count });
  }
  addCount2(count) {
    this.refresh({ count2: this.model.count2 + count });
  }
}
