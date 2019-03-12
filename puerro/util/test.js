"use strict";

function Assert() {
  const ok = [];
  return {
    getOk: () => ok,
    is: (actual, expected) => {
      const result = actual === expected;
      if (!result) {
        console.log(`expected "${expected}" but was "${actual}"`)
        try {
          throw Error();
        } catch (err) {
          console.log(err)
        };
      }
      ok.push(result);
    },
    true: cond => ok.push(cond)
  }
}

/**
 * Reports an executed test to the DOM
 *
 * @param {string} origin
 * @param {Array<bool>} ok
 */
function report(origin, ok) {
  const $report = document.createElement('div');
  $report.style.color = ok.every(elem => elem) ? 'green' : 'red';
  $report.style.paddingLeft = '20px';
  $report.textContent = `
    ${ok.filter(elem => elem).length}/${ok.length} Tests in ${origin} ok.
  `;
  document.body.appendChild($report);
}

/**
 * Creates group heading, to group tests together
 *
 * @param {string} name
 */
function reportGroup(name) {
  const $reportGroup = document.createElement('div');
  $reportGroup.style.fontWeight = 'bold';
  $reportGroup.style.marginTop = '10px';
  $reportGroup.textContent = `Test ${name}`
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
export function describe(name, callback) {
  reportGroup(name);
  return callback(test);
}