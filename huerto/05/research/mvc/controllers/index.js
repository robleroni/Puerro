export {
  controller
}

const controller = ({ state, act }) => ({
  getCount1: () => state.count1,
  getCount2: () => state.count2,
  addCount1: count => act(state => ({ ...state, count1: state.count1 + count })),
  addCount2: count => act(state => ({ ...state, count2: state.count2 + count }))
  
})