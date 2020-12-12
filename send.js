const sio = require('socket.io-client')
const ss = require('socket.io-stream')
const fs = require('fs')
const md5File = require('md5-file')
const minimist = require('minimist')
const path = require('path')
const commonUtil = require('./common')
const config = require('./config')

let argv = minimist(process.argv.slice(2));
if(argv._.length < 2) {
    console.info('Usage: ncfc send file [server] [options]')
    console.info('Example: ncfc send /path/to/file http://127.0.0.1:5000 [options]')
    process.exit()
}

// console.log(argv, process.cwd())
// console.log(argv, config)

let file = argv._[1]
let server = argv._[2] || process.env.SERVER || config.server

let stream
let fileSize
let transferedSize = 0
let startTime = 0

file = path.resolve(file)
// console.log(file)

console.log(`Connecting to server...`)

let socket = sio(server)
socket.on('connect', ()=>{
    console.log(`Connected to server ${server}`)
    stream = ss.createStream();
    let stats = fs.statSync(file)
    const hash = md5File.sync(file)
    fileSize = stats.size
    let fileInfo = {
        file: file,
        size: fileSize,
        md5: hash,
        name: path.basename(file)
    }
    ss(socket).emit('streamFile', stream, fileInfo, (ack)=>{
        console.log(`File accepted: ${file}, size=${fileInfo.size}`)
        console.log(`Receive it with command: \nncfc receive ${ack.fileId} ${fileInfo.name}`)
    });
    // stream.on('data',(data)=>{
    //     console.log('stream:data', data.length);
    // });
    stream.on('end',()=>{
        // console.log('stream:end');
        // console.log(`File size ${fileSize}, transferred ${transferedSize}`)
        if(fileSize === transferedSize) {
            console.log("\nFile sent OK")
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
    // stream.on('drain',(data)=>{
    //     console.log('stream:drain', data);
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

socket.on('startUpload', () => {
    // console.log("START UPLAOD")
    let readStream = fs.createReadStream(file, {highWaterMark: Math.pow(2,20)})
    readStream.pipe(stream);
    startTime = Date.now()

    readStream.on('data',(data)=>{
        // console.log('readStream:data', data.length);
        transferedSize += data.length
        let elapsed = Date.now() - startTime
        let perc = Math.round(transferedSize/fileSize * 100)
        commonUtil.printProgress(`Sending ${transferedSize} / ${fileSize}, perc ${perc} elapsed ${elapsed}`)
    });
    // readStream.on('end',()=>{
    //     console.log('readStream:end');
    // });
    // readStream.on('open',()=>{
    //     console.log('readStream:open');
    // });
    // readStream.on('error',()=>{
    //     console.log('readStream:error');
    // });
    // readStream.on('close',()=>{
    //     console.log('readStream:close');
    // });
    // readStream.on('readable',()=>{
    //     console.log('stream:readable');
    // });
    // readStream.on('drain',()=>{
    //     console.log('readStream:drain');
    // });
    // readStream.on('finish',()=>{
    //     console.log('readStream:finish');
    // });
    // readStream.on('close',()=>{
    //     console.log('readStream:close');
    // });
    // readStream.on('pipe',()=>{
    //     console.log('readStream:pipe', arguments);
    // });
    // readStream.on('unpipe',()=>{
    //     console.log('readStream:unpipe', arguments);
    // });
})
