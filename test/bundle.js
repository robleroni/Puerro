(function () {
    'use strict';

    function Assert() {
        const ok = [];
        return {
            getOk:  () => ok,
            is:     (actual, expected) => {
                const result = actual === expected;
                if(!result) {
                    console.log("expected '" + expected + "' but was '" + actual + "'");
                    try { throw Error(); }
                    catch (err) { console.log(err); }            }
                ok.push(result);
            },
            true:  cond => ok.push(cond)
        }
    }

    /**
     * Reports an executed test to the DOM
     *
     * @param {string} origin
     * @param {Array<bool>} ok
     */
    function report(origin, ok) {
        const $report = document.createElement('div');
        $report.textContent = `
        ${ok.filter(elem => elem).length}/${ok.length} Tests in ${origin} ok.
    `;
        document.body.appendChild($report);
    }

    /**
     * Adds and executes a test.
     *
     * @param {String} name
     * @param {Function} callback
     */
    function test(name, callback) {
        const assert = Assert();
        callback(assert);
        report(name, assert.getOk());
    }

    const ENTER_KEYCODE = 13;

    /**
     * Constructor function to create the Huerto UI
     *
     * @param {HTMLInputElement} $vegetable - Input element to add new vegetables
     * @param {HTMLElement} $vegetables - Container for the vegetables
     */
    function Huerto($vegetable, $vegetables) {
      const vegetables = [];

      function bindEvents() {
        $vegetable.addEventListener('keydown', e => {
          if (e.keyCode === ENTER_KEYCODE) {
            vegetables.push($vegetable.value);
            $vegetable.value = '';
            renderVegetables();
          }
        });
      }

      function renderVegetables() {
        return ($vegetables.innerHTML = vegetables
          .map(v => `<li>${v}</li>`)
          .join(''));
      }

      bindEvents();
    }

    test('renderVegetables', assert => {
      // given
      const $vegetable = document.createElement('input'),
        $vegetables = document.createElement('ul');
      Huerto($vegetable, $vegetables);

      // when
      $vegetable.value = 'tomato';
      $vegetable.dispatchEvent(
        new KeyboardEvent('keydown', { keyCode: ENTER_KEYCODE })
      );

      // then
      assert.is($vegetables.innerHTML, '<li>tomato</li>');
      assert.is($vegetable.value, '');
    });

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

    const ObservableList = list => {
      const addListeners = [];
      const delListeners = [];
      return {
        onAdd: listener => addListeners.push(listener),
        onDel: listener => delListeners.push(listener),
        add: item => {
          list.push(item);
          addListeners.forEach(listener => listener(item));
        },
        del: item => {
          const i = list.indexOf(item);
          if (i >= 0) {
            list.splice(i, 1);
          } // essentially "remove(item)"
          delListeners.forEach(listener => listener(item));
        },
        count: () => list.length,
        countIf: pred =>
          list.reduce((sum, item) => (pred(item) ? sum + 1 : sum), 0),
      };
    };

    test('value', assert => {
      const obs = Observable('');

      //  initial state
      assert.is(obs.getValue(), '');

      //  subscribers get notified
      let found;
      obs.onChange(val => (found = val));
      obs.setValue('firstValue');
      assert.is(found, 'firstValue');

      //  value is updated
      assert.is(obs.getValue(), 'firstValue');

      //  it still works when the receiver symbols changes
      const newRef = obs;
      newRef.setValue('secondValue');
      // listener updates correctly
      assert.is(found, 'secondValue');

      //  Attributes are isolated, no "new" needed
      const secondAttribute = Observable('');

      //  initial state
      assert.is(secondAttribute.getValue(), '');

      //  subscribers get notified
      let secondFound;
      secondAttribute.onChange(val => (secondFound = val));
      secondAttribute.setValue('thirdValue');
      assert.is(found, 'secondValue');
      assert.is(secondFound, 'thirdValue');

      //  value is updated
      assert.is(secondAttribute.getValue(), 'thirdValue');

      // subsribers get notified with access on old value
      let newFound, oldFound;
      secondAttribute.onChange((newVal, oldVal) => {
        newFound = newVal;
        oldFound = oldVal;
      });
      secondAttribute.setValue('fourthValue');
      assert.is(newFound, 'fourthValue');
      assert.is(oldFound, 'thirdValue');

      //  value is updated
      assert.is(secondAttribute.getValue(), 'fourthValue');
    });

    test('list', assert => {
      const raw = [];
      const list = ObservableList(raw); // decorator pattern

      assert.is(list.count(), 0);
      let addCount = 0;
      let delCount = 0;
      list.onAdd(item => (addCount += item));
      list.add(1);
      assert.is(addCount, 1);
      assert.is(list.count(), 1);
      assert.is(raw.length, 1);

      list.onDel(item => (delCount += item));
      list.del(1);
      assert.is(delCount, 1);
      assert.is(list.count(), 0);
      assert.is(raw.length, 0);
    });

    // Generated file

}());
