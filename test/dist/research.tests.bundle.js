(function () {
  'use strict';

  (function () {

    /**
     * Creates a new HTMLElement
     * @param {string} tagName
     *
     * @returns {function(content): HTMLElement}
     */
    const createElement = (tagName, attributes = {}) => content => {
      const $element = document.createElement(tagName);
      $element.innerHTML = content;
      Object.keys(attributes).forEach(key => {
        if (typeof attributes[key]  === "function") {
          $element.addEventListener(key, attributes[key]);
        } else {
          $element.setAttribute(key, attributes[key]);
        }
      });
      return $element;
    };

    function Assert() {
      const ok = [];
      return {
        getOk: () => ok,
        is: (actual, expected) => {
          const result = actual === expected;
          if (!result) {
            console.log(`expected "${expected}" but was "${actual}"`);
            try {
              throw Error();
            } catch (err) {
              console.log(err);
            }
          }
          ok.push(result);
        },
        true: cond => ok.push(cond),
      };
    }

    /**
     * Reports an executed test to the DOM
     *
     * @param {string} origin
     * @param {Array<bool>} ok
     */
    function report(origin, ok) {
      const style = `
    color: ${ok.every(elem => elem) ? 'green' : 'red'};
    padding-left: 20px;
  `;
      const $report = createElement('div', { style })(`
    ${ok.filter(elem => elem).length}/${ok.length} Tests in ${origin} ok.
  `);
      document.body.appendChild($report);
    }

    /**
     * Creates group heading, to group tests together
     *
     * @param {string} name
     */
    function reportGroup(name) {
      const style = `
    font-weight: bold;
    margin-top: 10px;
  `;
      const $reportGroup = createElement('div', { style })(`Test ${name}`);
      document.body.appendChild($reportGroup);
    }

    /**
     * Adds and executes a test.
     *
     * @param {String} name
     * @param {Function} callback
     */
    function test(name, callback) {
      const assert = Assert();
      callback(assert);
      report(name, assert.getOk());
    }

    /**
     * Adds a testGroup to the test report
     *
     * @param {String} name
     * @param {Function} callback
     */
    function describe(name, callback) {
      reportGroup(name);
      return callback(test);
    }

    var sum = (a, b) => a + b;

    describe('01 - Research', test => {
      test('adding numbers', assert => {
        // given
        const a = 2;
        const b = 2;

        // when
        const result = sum(a, b);

        // then
        assert.is(result, 4);
      });
    });

  }());

  // Generated file

}());
