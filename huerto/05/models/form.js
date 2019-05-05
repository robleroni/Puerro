export { getInitialFormState };

const formModel = {
  id: 0,
  name: '',
  classification: 'Tubers',
  origin: '',
  amount: 1,
  comments: '',
};
const getInitialFormState = () => ({ ...formModel });
