const sio = require('socket.io')
const http = require('http')
const ss = require('socket.io-stream')
const fs = require('fs')

const DEFAULT_PORT = process.env.port || 5000
const DEF_HOST = process.env.host || '0.0.0.0'

let streamFiles = {}

let transmitterSocket
let receiverSocket

let host = DEF_HOST
let port = DEFAULT_PORT

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
            let fileId = socket.id
            // fileId = 'TEST'
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
                // console.log('stream:end');
            });
            stream.pause()
            ack({
                fileId: fileId
            })
        })

        ss(socket).on('readFile', (stream, data, ack)=>{
            receiverSocket = socket
            console.log(`Sending file to client ${socket.id} ${JSON.stringify(data)}`)
            let fileId = data.fileId
            let sourceStream = streamFiles[fileId].stream
            if(streamFiles[fileId]) {
                sourceStream.pipe(stream)
                sourceStream.resume()
            }

            transmitterSocket.emit('startUpload')

            ack(
                streamFiles[fileId].file
            )
        })
    })
})
