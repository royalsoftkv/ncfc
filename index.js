const minimist = require('minimist')
require('dotenv').config()

let argv = minimist(process.argv.slice(2));
if(argv._.length === 0) {
    console.info('Usage: ncfc (server|send|receive) [options]')
    process.exit()
}


let action = argv._[0]
if(action === 'server') {
    require('./server')
} else if (action === 'send') {
    require('./send')
} else if (action === 'receive') {
    require('./receive')
} else {
    console.error(`Invalid action ${action}`)
    console.info('Usage: ncfc (server|send|receive) [options]')
    process.exit()
}
