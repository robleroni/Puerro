import { PuerroController } from '../../../../../src/mvc/controller';

export { ResearchController };

class ResearchController extends PuerroController {
  /**
   *
   * @param {number} count
   */
  addCount1(count) {
    this.refresh({ count1: this.model.count1 + count });
  }

  /**
   *
   * @param {number} count
   */
  addCount2(count) {
    this.refresh({ count2: this.model.count2 + count });
  }
}
