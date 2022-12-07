require("dotenv").config()
const express = require('express')
const app = express()
const websocket = require('express-ws')(app)
const cors = require('cors')
const corsOptions = require("./config/corsOptions");
const aWss = websocket.getWss()

app.use(express.json())
app.use(cors(corsOptions))


const PORT = process.env.PORT || 5000

app.ws('/', (ws, req) => {
    ws.isAlive = true
    ws.on('message', (message) => {
        const msgObject = JSON.parse(message)
        switch (msgObject.method) {
            case 'connection':
                connectionHandler(ws, msgObject)
                break
            case 'pong':
                heartbeat(ws)
                break
            default:
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

const heartbeat = (ws) => {
    ws.isAlive = true
}

const ping = (ws) => {
    ws.send(JSON.stringify('ping'))
}

setInterval(() => {
    aWss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate()
        }

        ws.isAlive = false
        ws.ping(() => { ping(ws) })
    })
}, 5000)