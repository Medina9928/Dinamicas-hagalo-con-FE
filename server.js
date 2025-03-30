const WebSocket = require('ws');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/rifa', { useNewUrlParser: true, useUnifiedTopology: true });

// Definir un esquema y modelo para los números seleccionados
const numberSchema = new mongoose.Schema({
    number: String,
    selected: Boolean
});

const NumberModel = mongoose.model('Number', numberSchema);

// Rutas
app.get('/numbers', async (req, res) => {
    const numbers = await NumberModel.find();
    res.json(numbers);
});

app.post('/numbers', async (req, res) => {
    const { number, selected } = req.body;
    const existingNumber = await NumberModel.findOne({ number });
    if (existingNumber) {
        existingNumber.selected = selected;
        await existingNumber.save();
    } else {
        const newNumber = new NumberModel({ number, selected });
        await newNumber.save();
    }
    // Emitir un evento a todos los clientes conectados
    broadcast(JSON.stringify({ number, selected }));
    res.status(201).send();
});

// Configurar WebSocket
const wss = new WebSocket.Server({ noServer: true });

app.server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}