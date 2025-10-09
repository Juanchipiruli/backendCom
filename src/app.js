const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const routes = require('./routes/index.routes');
require('dotenv').config();
const http = require('http');
const socket = require('./socket'); // Importamos el módulo
const espSocket = require('./espSocket');
const { getESP } = require('./espSocket');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/', routes);
const server = http.createServer(app);
const io = socket.init(server);

io.on('connection', (socket) => {
    console.log('Cliente conectado via WebSocket');

    socket.on('enroll_request', ({ sensorId }) => {
        try {
          const esp = getESP(sensorId);
          if (esp && esp.readyState === 1) { // 1 = OPEN
            esp.send('ENROLL');
            io.emit('esp_log', { sensorId, message: `📤 Comando ENROLL enviado al ESP ${sensorId}` });
          } else {
            io.emit('esp_log', { sensorId, message: '❌ ESP no conectado o no registrado.' });
          }
        } catch (error) {
          io.emit('esp_log', { sensorId, message: `⚠️ Error al enviar comando: ${error.message}` });
        }
      });
  
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

const espServer = http.createServer();
espSocket.init(espServer, io);
espServer.listen(8081, () => {
    console.log('Servidor WebSocket para ESP escuchando en puerto 8081');
    });
  

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Algo salió mal!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Función para iniciar el servidor y sincronizar la base de datos
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        
        await sequelize.sync({ force: false });
        console.log('Base de datos sincronizada correctamente.');
        
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar el servidor
startServer();

module.exports = app;
