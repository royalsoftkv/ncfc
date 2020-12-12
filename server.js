const sio = require('socket.io')
const http = require('http')
const ss = require('socket.io-stream')
const fs = require('fs')
const config = require('./config')
const env = process.env.NODE_ENV || 'development';

let streamFiles = {}

let transmitterSocket
let receiverSocket

let host = process.env.HOST || config.host || '0.0.0.0'
let port = process.env.PORT || config.port || 5000

const requestListener = function (req, res) {
    if(req.url === '/ncfc') {
        let readStream = fs.createReadStream('./ncfc')
        readStream.pipe(res)
    }
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    const io = sio.listen(server)
    console.log(`Server ready. Listen on ${host}:${port} `)
    io.on('connect',(socket) => {
        console.log(`Connected clint ${socket.id}`)

        ss(socket).on('streamFile', (stream, data, ack)=>{
            transmitterSocket = socket
            console.log(`Reading file form client ${socket.id} ${JSON.stringify(data)}`)
            let fileId = env === 'development' ? 'dev_file_id' : socket.id
            streamFiles[fileId]={
                file: data,
                stream: stream
            }
            totalTransfered = 0
            stream.on('data',(data)=>{
                totalTransfered += data.length
                // console.log(`Transfered ${totalTransfered}`)
            });
            stream.on('end',()=>{
                console.log('stream:end');
            });
            stream.pause()
            ack({
                fileId: fileId
            })
        })

        ss(socket).on('readFile', (stream, data, ack)=>{
            let fileId = data.fileId
            if(streamFiles[fileId] && transmitterSocket.connected) {
                receiverSocket = socket
                console.log(`Sending file to client ${socket.id} ${JSON.stringify(data)}`)
                let sourceStream = streamFiles[fileId].stream
                sourceStream.pipe(stream)
                sourceStream.resume()
                transmitterSocket.emit('startUpload')
                ack(
                    streamFiles[fileId].file
                )
            } else {
                console.log(`File with fileId=${fileId} not in queue`)
                ack(false)
            }

        })

        socket.on('endFile', (fileId, ack) => {
            delete streamFiles[fileId]
            ack(fileId)
        })
    })
})
