export { Observable, ObservableList };

const Observable = value => {
  const listeners = [];
  return {
    onChange: callback => listeners.push(callback),
    getValue: () => value,
    setValue: newValue => {
      if (value === newValue) return;
      listeners.forEach(notify => notify(newValue, value));
      value = newValue;
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

const ObservableList = list => {
  const addListeners = [];
  const removeListeners = [];
  return {
    onAdd: listener => addListeners.push(listener),
    onRemove: listener => removeListeners.push(listener),
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
    count: () => list.length,
    countIf: pred => list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
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
