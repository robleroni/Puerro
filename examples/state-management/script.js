import { mount } from '../../src/vdom/vdom';
import { component } from './example';

const intialState = {
  num1: 0,
  num2: 0,
}

mount(document.body, component, intialState);