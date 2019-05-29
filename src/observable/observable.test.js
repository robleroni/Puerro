import { describe } from '../test/test';
import { Observable, ObservableList, ObservableObject } from './observable';

describe('Observables', test => {
  test('Observable Value', assert => {
    // given
    const observable1 = Observable('');
    const observable2 = Observable('');

    let newValue1, oldValue1, newValue2, oldValue2;
    observable1.onChange((newVal, oldVal) => { newValue1 = newVal; oldValue1 = oldVal; });
    observable2.onChange((newVal, oldVal) => { newValue2 = newVal; oldValue2 = oldVal; });
    
    // initial state
    assert.is(observable1.get(), '');

    // when  
    observable1.set('Puerro');

    // then 
    assert.is(newValue1,         'Puerro'); // subscribers got notified  
    assert.is(oldValue1,         '');       // subscribers got notified  
    assert.is(observable1.get(), 'Puerro'); // value has updated

    // when the receiver symbol changes
    const newRef = observable1;
    newRef.set('Huerto');

    // then listener still updates correctly
    assert.is(newValue1,         'Huerto'); // subscribers got notified  
    assert.is(oldValue1,         'Puerro'); // subscribers got notified  
    assert.is(observable1.get(), 'Huerto'); // value has updated

    // when
    observable2.set('Puerro');

    // then subscribers get notified
    assert.is(newValue1,         'Huerto');
    assert.is(newValue2,         'Puerro');
    assert.is(oldValue1,         'Puerro');
    assert.is(oldValue2,         '');
    assert.is(observable2.get(), 'Puerro'); //  value is updated
  });

  test('Observable List', assert => {
    // given
    const raw = [];
    const list = ObservableList(raw); // decorator pattern

    let addCount = 0, removeCount = 0;
    list.onAdd   (item => (addCount    += item));
    list.onRemove(item => (removeCount += item));

    // initial
    assert.is(list.count(), 0);
    assert.is(raw.length,   0);

    // when
    list.add(1);

    // then
    const index = list.indexOf(1);
    assert.is(addCount,        1);
    assert.is(list.count(),    1);
    assert.is(raw.length,      1);
    assert.is(index,           0);
    assert.is(list.get(index), 1);

    // when
    list.remove(1);

    // then
    assert.is(removeCount,  1);
    assert.is(list.count(), 0);
    assert.is(raw.length,   0);
  });

  test('Observable Object', assert => {
    // given
    const object = ObservableObject({}); // decorator pattern

    let newObject, oldObject, newValue, oldValue;
    object.onChange (         (newObj, oldObj) => { newObject = newObj; oldObject = oldObj; });
    object.subscribe('value', (newVal, oldVal) => { newValue  = newVal; oldValue  = oldVal; });
    
    // initial
    assert.objectIs(object.get(), {});
    assert.objectIs(oldObject,    {});
    assert.objectIs(newObject,    {});
    assert.is      (oldValue,     undefined);
    assert.is      (newValue,     undefined);

    // when
    object.set({ value: 1 })

    // then
    assert.objectIs(oldObject,    {});
    assert.objectIs(newObject,    { value: 1 });
    assert.is      (oldValue,     undefined);
    assert.is      (newValue,     1);

    // when
    object.push('text', 'Puerro');

    // then
    assert.objectIs(oldObject,    { value: 1 });
    assert.objectIs(newObject,    { value: 1, text: 'Puerro' });
    assert.is      (oldValue,     undefined);
    assert.is      (newValue,     1);

    // when
    object.replace({ text: 'Huerto' });

    // then
    assert.objectIs(oldObject,    { value: 1,         text: 'Puerro' });
    assert.objectIs(newObject,    { value: undefined, text: 'Huerto' });
    assert.is      (oldValue,     1);
    assert.is      (newValue,     undefined);

    // when
    object.set({ value: 2 });

    // then
    assert.objectIs(oldObject,    { value: undefined, text: 'Huerto' });
    assert.objectIs(newObject,    { value: 2,         text: 'Huerto' });
    assert.is      (oldValue,     undefined);
    assert.is      (newValue,     2);

    // when
    object.set({ value: 1 });

    // then
    assert.objectIs(oldObject,    { value: 2, text: 'Huerto' });
    assert.objectIs(newObject,    { value: 1, text: 'Huerto' });
    assert.is      (oldValue,     2);
    assert.is      (newValue,     1);

    // when
    object.remove('value');

    // then
    assert.objectIs(object.get(), newObject);
    assert.objectIs(oldObject,    { value: 1,         text: 'Huerto' });
    assert.objectIs(newObject,    { value: undefined, text: 'Huerto' });
    assert.is      (oldValue,     1);
    assert.is      (newValue,     undefined);
  });
});
