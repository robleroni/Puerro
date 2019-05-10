import { CounterController, model as itemModel,   View as ItemView } from './counter';
import { ResultController,  model as resultModel, View as ResultView } from './result';

const adder      = new CounterController(document.querySelector('#adder'),      itemModel,   ItemView);
const multiplier = new CounterController(document.querySelector('#multiplier'), itemModel,   ItemView);
const result     = new ResultController (document.querySelector('#result'),     resultModel, ResultView);

adder     .state.subscribe('counter', counter => result.setCounter1(counter))
multiplier.state.subscribe('counter', counter => result.setCounter2(counter))
