/**
 * A Module to use for testing.
 *
 * @module test
 */

import { createDomElement } from '../vdom/vdom';

export { describe }

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
 * Creates a new Assert object
 */
function Assert() {
  const ok = [];

  const assert = (actual, expected, result)=> {
    if (!result) {
      console.log(`expected "${expected}" but was "${actual}"`);
      try {
        throw Error();
      } catch (err) {
        console.log(err);
      }
    }
    ok.push(result);
  }

  return {
    getOk: () => ok,
    is: (actual, expected) => assert(actual, expected, actual === expected),
    objectIs: (actual, expected) =>
      assert(actual, expected,
        Object.entries(actual).toString() === Object.entries(expected).toString()
      ),
    true: cond => ok.push(cond),
  };
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
  const $reportGroup = createDomElement('div', { style }, `Test ${name}`);
  document.body.appendChild($reportGroup);
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
  const $report = createDomElement('div', { style },`
    ${ok.filter(elem => elem).length}/${ok.length} Tests in ${origin} ok.
  `);
  document.body.appendChild($report);
}


