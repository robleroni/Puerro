var _ = (function (exports) {
  'use strict';

  const Vegetable = (name, amount) => {
    return {
      getName: () => name,
      getAmount: () => amount,
      toString: () => `${name}: ${amount}`,
    };
  };

  exports.Vegetable = Vegetable;

  return exports;

}({}));
