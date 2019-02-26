"use strict";

function Assert() {
    const ok = [];
    return {
        getOk:  () => ok,
        is:     (actual, expected) => {
            const result = actual === expected;
            if(!result) {
                console.log("expected '" + expected + "' but was '" + actual + "'");
                try { throw Error(); }
                catch (err) { console.log(err) };
            }
            ok.push(result);
        },
        true:  cond => ok.push(cond)
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
    $report.innerHTML = `
        ${ok.filter(elem => elem).length}/${ok.length} Tests in ${origin} ok.
    `;
    document.body.appendChild($report);
}

/**
 * Adds and executes a test.
 *
 * @param {String} name
 * @param {Function} callback
 */
export function test(name, callback) {
    const assert = Assert();
    callback(assert);
    report(name, assert.getOk());
}