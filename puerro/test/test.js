"use strict";

// find a solution for suite, test, assert

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

function test(name, callback) {
    const assert = Assert();
    callback(assert);
    report(name, assert.getOk());
}

// test result report
// report :: String, [Bool] -> DOM ()
function report(origin, ok) {
    const extend = 20;
    if ( ok.every( elem => elem) ) {
        document.writeln(" "+ padLeft(ok.length, 3) +" tests in " + padRight(origin, extend) + " ok.");
        document.write("<br/>")
        return;
    }
    let reportLine = "    Failing tests in " + padRight(origin, extend);
    bar(reportLine.length);
    document.writeln("|" + reportLine+ "|");
    for (let i = 0; i < ok.length; i++) {
        if( ! ok[i]) {
            document.writeln("|    Test #"+ padLeft(i, 3) +" failed                     |");
        }
    }
    bar(reportLine.length);
}

function bar(extend) {
    document.writeln("+" + "-".repeat(extend) + "+");
}

// padRight :: String, Int -> String
function padRight(str, extend) {
    return "" + str + fill(str, extend);
}

function padLeft(str, extend) {
    return "" + fill(str, extend) + str;
}

function fill(str, extend) {
    const len = str.toString().length; // in case str is not a string
    if (len > extend) {
        return str;
    }
    return " ".repeat(extend - len);
}