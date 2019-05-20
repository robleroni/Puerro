(function () {
  'use strict';

  /**
   * Observable Pattern Implementation
   *
   * @module observable
   */

  const Observable = item => {
    const listeners = [];
    return {
      get: () => item,
      set: newItem => {
        if (item === newItem) return;
        const oldItem = item;
        item = newItem;
        listeners.forEach(notify => notify(newItem, oldItem));
      },
      onChange: callback => {
        listeners.push(callback);
        callback(item, item);
      },
    };
  };

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

}());
