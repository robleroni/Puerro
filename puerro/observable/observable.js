/**
 * Observable Pattern Implementation
 *
 * @module observable
 */

export { Observable, ObservableList };

const Observable = item => {
  const listeners = [];
  return {
    onChange: callback => {
      listeners.push(callback);
      callback(item, item);
    },
    get: () => item,
    set: newItem => {
      if (item === newItem) return;
      const oldItem = item;
      item = newItem;
      listeners.forEach(notify => notify(newItem, oldItem));
    },
  };
};

const Observer = callback => {
  return {
    observe: observable => observable.onChange(callback),
  };
};

const EventObservable = obj => {
  const events = { CHANGED: 0, ADDED: 1, REMOVED: 2, MADE_INVALID: 3 };
  const observers = [];
  return {
    events,
    get: () => obj,
    onChange: observer => observers.push(observer),
    changeTo: (newObj, event = events.CHANGED) => {
      if (obj === newObj) return;
      observers.forEach(notify => notify(newObj, event, obj));
      obj = newObj;
    },
  };
};

/**
 *
 * @param {any[]} list
 */
const ObservableList = list => {
  const addListeners = [];
  const removeListeners = [];
  const replaceListeners = [];
  return {
    onAdd: listener => addListeners.push(listener),
    onRemove: listener => removeListeners.push(listener),
    onReplace: listener => replaceListeners.push(listener),
    add: item => {
      list.push(item);
      addListeners.forEach(listener => listener(item));
    },
    remove: item => {
      const i = list.indexOf(item);
      if (i >= 0) {
        list.splice(i, 1);
      } // essentially "remove(item)"
      removeListeners.forEach(listener => listener(item));
    },
    replace: (item, newItem) => {
      const i = list.indexOf(item);
      if (i >= 0) {
        list[i] = newItem;
      }
      replaceListeners.forEach(listener => listener(newItem, item));
    },
    count: () => list.length,
    countIf: pred => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
    indexOf: item => list.indexOf(item),
    get: index => list[index],
    getAll: () => list,
  };
};

const ObservableForm = form => {
  return Object.getOwnPropertyNames(HTMLElement.prototype)
    .filter(p => p.startsWith('on'))
    .reduce((events, event) => {
      events[event] = callback => selector => {
        const elements = selector ? form.querySelectorAll(selector) : form.querySelectorAll('*');
        elements.forEach(element => element.addEventListener(event.substring(2), e => callback(e)));
      };
      return events;
    }, {});
};
