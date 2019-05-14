import { h } from '../../../../../src/vdom/vdom';
import { counterComponent } from '../components/counter';
import { addView } from './add';
import { multiplyView } from './multiply';

export {
  view as mainView
}

const view = (controller) =>
  h('main', {},
    h('div',{},
      counterComponent(controller.model.count1, 'count1', c => controller.addCount1(c)),
      counterComponent(controller.model.count2, 'count2', c => controller.addCount2(c)),
    ),
    h('div',{},
      addView(controller),
      multiplyView(controller),
    )
  );