import { mount } from '../../src/vdom/vdom';
import { view } from './example';

const intialState = {
  num1: 0,
  num2: 0,
}

mount(document.body, view, intialState);