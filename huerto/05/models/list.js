export { getInitialListState };

const listModel = {
  selected: {},
  vegetables: [],
};
const getInitialListState = () => ({ ...listModel });
