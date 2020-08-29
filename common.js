const readline = require('readline');

function round(num, dec = 2) {
    let m = Math.pow(10, dec);
    return Math.round(num*m) / m;
}

function printProgress(progress){
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0, null)
    process.stdout.write(`${progress}`);
}

module.exports = {
    round,
    printProgress
}
