const sio = require('socket.io-client')
const ss = require('socket.io-stream')
const fs = require('fs')
const md5File = require('md5-file')
var readline = require('readline');
const minimist = require('minimist')
const path = require('path')
const commonUtil = require('./common')
const config = require('./config')

let argv = minimist(process.argv.slice(2));
if(argv._.length < 2) {
    console.info('Usage: ncfc receive fileId [file] [server] [options]')
    console.info('Example: ncfc receive <fileId> <server> <file> [options]')
    process.exit()
}

let fileId = argv._[1]
let file = argv._[2]
let server = argv._[3] || process.env.SERVER || config.server

file = path.resolve(file)

let socket = sio(server)
socket.on('connect', ()=>{
    console.log(`Connected to server ${server}`)
    let stream = ss.createStream();
    let md5
    let size
    ss(socket).emit('readFile', stream, {fileId: fileId}, (fileInfo)=>{
        if(fileInfo === false) {
            console.error(`Requested file id does not available`)
            process.exit()
        }
        md5 = fileInfo.md5
        size = fileInfo.size
        if(!file) {
            file = path.join(process.cwd(),fileInfo.name)
        }
        stream.pipe(fs.createWriteStream(file));
    });

    let streamLength = 0
    let startTime = Date.now()
    let elapsed =0

    stream.on('data',(data)=>{
        // console.log('stream:data', data.length);
        streamLength += data.length
        let perc = Math.round(streamLength/size * 100)
        elapsed = Date.now() - startTime
        let speed = Math.round((streamLength / elapsed) * 1000)
        speed = commonUtil.round(speed /1024 / 1024,2)
        commonUtil.printProgress(`Receiving ${streamLength} of ${size}, perc ${perc} elapsed ${elapsed}, speed ${speed} MB/s`)
    });
    stream.on('end',()=>{
        // console.log('stream:end');
        let speed = Math.round((streamLength / elapsed) * 1000)
        speed = commonUtil.round(speed /1024 / 1024,2)
        console.log(`\nFile size ${size}, transfered ${streamLength} time=${elapsed} speed ${speed} MB/s`)
        const hash = md5File.sync(file)
        // console.log(`File hash ${md5}, transfered ${hash}`)
        if(size === streamLength && md5 === hash) {
            console.log(`File ${file} received OK`)
            socket.emit('endFile',fileId, res => {
                if(res === fileId) {
                    process.exit()
                }
            })
        }
    });
})
