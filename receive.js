const sio = require('socket.io-client')
const ss = require('socket.io-stream')
const fs = require('fs')
const md5File = require('md5-file')
var readline = require('readline');
const minimist = require('minimist')
const path = require('path')
const commonUtil = require('./common')

let argv = minimist(process.argv.slice(2));
if(argv._.length < 2) {
    console.info('Usage: ncfc receive fileId [server] [file] [options]')
    console.info('Example: ncfc receive <fileId> http://127.0.0.1:5000 /path/to/file [options]')
    process.exit()
}

let fileId = argv._[1]
let server = argv._[2] || `http://${process.env.host}:${process.env.port}`
let file = argv._[3]

let socket = sio(server)
socket.on('connect', ()=>{
    console.log(`Connected to server`)
    let stream = ss.createStream();
    let md5
    let size
    ss(socket).emit('readFile', stream, {fileId: fileId}, (fileInfo)=>{
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
        }
        process.exit()
    });
    // stream.on('error',(err)=>{
    //     console.log('stream:error', err);
    // });
    // stream.on('close',()=>{
    //     console.log('stream:close');
    // });
    // stream.on('readable',()=>{
    //     console.log('stream:readable');
    // });
    // stream.on('drain',()=>{
    //     console.log('stream:drain');
    // });
    // stream.on('finish',()=>{
    //     console.log('stream:finish');
    // });
    // stream.on('close',()=>{
    //     console.log('stream:close');
    // });
    // stream.on('pipe',()=>{
    //     console.log('stream:pipe');
    // });
    // stream.on('unpipe',()=>{
    //     console.log('stream:unpipe');
    // });
})
