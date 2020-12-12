const minimist = require('minimist')

let argv = minimist(process.argv.slice(2));
if(argv._.length === 0) {
    console.info('Usage: ncfc (server|send|receive|version|install) [options]')
    process.exit()
}


let action = argv._[0]
if(action === 'server') {
    require('./server')
} else if (action === 'send') {
    require('./send')
} else if (action === 'receive') {
    require('./receive')
} else if (action === 'version') {
    let pjson = require('./package.json')
    console.info(pjson.version)
    process.exit()
} else if (action === 'install') {
    const fs = require('fs')
    const path = require('path')
    fs.mkdirSync(path.join(process.cwd(), 'bin'),{ recursive: true })
    let file = path.join(process.cwd(), 'bin', 'ncfc')
    let content = `#/bin/bash
node ${process.cwd()}/index.js "$@"`
    fs.writeFileSync(file, content)
    fs.chmodSync(file, 0o755)
    let binFile = '/usr/bin/ncfc'
    if(fs.existsSync(binFile)){
        fs.unlinkSync(binFile)
    }
    fs.symlinkSync(file, binFile)
} else {
    console.error(`Invalid action ${action}`)
    console.info('Usage: ncfc (server|send|receive) [options]')
    process.exit()
}
