import { Observable } from '../../../../src/observable/observable';

export { Vegetable };

/**
 * @typedef {{ id: number, name: string, classification: string, origin: string, amount: number, comments: string  }} Vegetable
 */

/**
 * Creates a vegetable
 */
const Vegetable = () => {
  const _id = Observable(0);
  const _name = Observable('');
  const _classification = Observable('');
  const _origin = Observable('');
  const _plantend = Observable(false);
  const _amount = Observable(0);
  const _comments = Observable('');

  return {
    getId: () => _id.get(),
    getName: () => _name.get(),
    getClassification: () => _classification.get(),
    getOrigin: () => _origin.get(),
    getPlanted: () => _plantend.get(),
    getAmount: () => _amount.get(),
    getComments: () => _comments.get(),
    setId: id => _id.set(id),
    setName: name => _name.set(name),
    setClassification: classification => _classification.set(classification),
    setOrigin: origin => _origin.set(origin),
    setPlanted: plantend => _plantend.set(plantend),
    setAmount: amount => _amount.set(amount),
    setComments: comments => _comments.set(comments),

    toString: () => `
        ${_name.get()} (${_classification.get()}) from ${_origin.get()},
        ${_plantend.get() ? `planted (${_amount.get()})` : 'not planted'},
        ${_comments.get()}
      `,
  };
};
