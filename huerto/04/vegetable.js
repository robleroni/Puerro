
import { Observable } from '../../puerro/observable/observable';

export { Vegetable }

const Vegetable = () => {
  const _id             = Observable(0);
  const _name           = Observable('');
  const _classification = Observable('');
  const _origin         = Observable('');
  const _plantend       = Observable(false);
  const _amount         = Observable(0);
  const _comments       = Observable('');

  return {
    getId:              ()              => _id.getValue(),
    getName:            ()              => _name.getValue(),
    getClassification:  ()              => _classification.getValue(),
    getOrigin:          ()              => _origin.getValue(),
    getPlanted:         ()              => _plantend.getValue(),
    getAmount:          ()              => _amount.getValue(),
    getComments:        ()              => _comments.getValue(),
    setId:              id              => _id.setValue(id),
    setName:            name            => _name.setValue(name),
    setClassification:  classification  => _classification.setValue(classification),
    setOrigin:          origin          => _origin.setValue(origin),
    setPlanted:         plantend        => _plantend.setValue(plantend),
    setAmount:          amount          => _amount.setValue(amount),
    setComments:        comments        => _comments.setValue(comments),

    toString: () => `
        ${_name.getValue()} (${_classification.getValue()}) from ${_origin.getValue()},
        ${_plantend.getValue() ? `planted (${_amount.getValue()})` : 'not planted'},
        ${_comments.getValue()}
      `,
  };
};
