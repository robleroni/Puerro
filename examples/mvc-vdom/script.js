import { view, CounterController } from './example';

const model = { counter: 0 };

new CounterController(document.body, model, view);
