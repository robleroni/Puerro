export { controller };

const controller = ({ state, setState }) => ({
  getCount1: ()    => state.count1,
  getCount2: ()    => state.count2,
  addCount1: count => setState(state => ({ ...state, count1: state.count1 + count })),
  addCount2: count => setState(state => ({ ...state, count2: state.count2 + count })),
});
