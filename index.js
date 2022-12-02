const express = require('express')
const app = express()
const websocket = require('express-ws')(app)
const aWss = websocket.getWss()

app.use(express.json())


const PORT = process.env.PORT || 5000

app.ws('/', (ws, req) => {
    ws.on('message', (message) => {
        const msgObject = JSON.parse(message)
        switch (msgObject.method) {
            case 'connection':
                connectionHandler(ws, msgObject)
                break
            case 'draw':
                broadCastConnection(ws, msgObject)
                break
            case 'text':
                broadCastConnection(ws, msgObject)
                break
        }
    })
})

app.listen(PORT, () => console.log(`Running on port ${PORT}`))

const connectionHandler = (ws, msg) => {
    ws.username = msg.username
    ws.id = msg.id
    broadCastConnection(ws, msg)
}

const broadCastConnection = (ws, msg) => {
    aWss.clients.forEach(client => {
        if(client.id === msg.id) {
            client.send(JSON.stringify(msg))
        }
    })
}
