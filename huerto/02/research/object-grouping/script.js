export { Vegetable };

const Vegetable = (name, amount) => {
  return {
    getName: () => name,
    getAmount: () => amount,
    toString: () => `${name}: ${amount}`,
  };
};
