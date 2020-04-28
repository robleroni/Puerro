import { Observable } from '../../src/observable/observable';

export { Vegetable };

const id = idGenerator();
function* idGenerator() {
  let id = 0;
  while (true) yield ++id;
}

const Vegetable = () => {
  const _id = Observable(id.next().value);
  const _name = Observable('Vegi');
  const _classification = Observable('');
  const _origin = Observable('Europe');
  const _plantend = Observable(true);
  const _amount = Observable(1);
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
  };
};
