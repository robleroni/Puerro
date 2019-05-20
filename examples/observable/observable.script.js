import { Observable } from '../../src/observable/observable';

const nameInput = document.getElementById('name');
const label = document.getElementById('label');
const size = document.getElementById('size');
const difference = document.getElementById('difference');

const inputAttr = Observable('');
inputAttr.onChange(val => (label.textContent = val));
inputAttr.onChange(val => (size.textContent = val.length));
inputAttr.onChange(
  (newVal, oldVal) => (difference.textContent = newVal.length - oldVal.length)
);

nameInput.oninput = _ => inputAttr.set(nameInput.value);