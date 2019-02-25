

const Observable = value => {
    const listeners = [];
    return {
        onChange: callback => listeners.push(callback),
        getValue: ()       => value,
        setValue: val      => {
            if (value === val) return;
            value = val;
            listeners.forEach(notify => notify(val));
        }
    }
};

const ObservableList = list => {
    const addListeners = [];
    const delListeners = [];
    return {
        onAdd: listener => addListeners.push(listener),
        onDel: listener => delListeners.push(listener),
        add: item => {
            list.push(item);
            addListeners.forEach( listener => listener(item))
        },
        del: item => {
            const i = list.indexOf(item);
            if (i >= 0) { list.splice(i, 1) } // essentially "remove(item)"
            delListeners.forEach( listener => listener(item));
        },
        count:   ()   => list.length,
        countIf: pred => list.reduce( (sum, item) => pred(item) ? sum + 1 : sum, 0)
    }
};

const ObservableForm = form => {
    return Object.getOwnPropertyNames(HTMLElement.prototype)
        .filter(p => p.startsWith('on'))
        .reduce((events, event) => {
            events[event] = callback => selector =>  {
                const elements = selector ? form.querySelectorAll(selector) : form.querySelectorAll('*');
                elements.forEach(element => element.addEventListener(event.substring(2), e => callback(e)));
            }
            return events;
    }, {});
}