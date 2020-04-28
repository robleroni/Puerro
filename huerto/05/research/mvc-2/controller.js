import { Observable } from '../../../../src/observable/observable';

export { controller };

const controller = (model, refresh) => {
  return {
    getMessage: () => ` Input: ${model.name}`,
    setName: name => {
      model.name = name;
      refresh(model);
    },
  };
};
