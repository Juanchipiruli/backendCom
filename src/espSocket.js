// espSocket.js
const WebSocket = require('ws');

let wss;
// Mapa de sensorId -> WebSocket client
const espClients = new Map();

module.exports = {
  init: (server, io) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
      const id = ws.sensorId || 'desconocido';
      console.log('ESP32 conectado por WebSocket');
      io.emit("esp_log", { sensorId: id, message: "🟢 ESP32 conectado al backend", timestamp: Date.now() });

      ws.on('message', (msg) => {
        console.log(`Mensaje del ESP: ${msg}`);

        try {
          const data = JSON.parse(msg);

          // Si el ESP envía su sensorId, lo registramos
          if (data.sensorId) {  
            espClients.set(data.sensorId, ws);
            ws.sensorId = data.sensorId;
            console.log(`ESP registrado con sensorId: ${data.sensorId}`);
            return;
          }

          // Si el ESP envía estado, lo podemos guardar en global o DB
          if (data.estado) {
            console.log(`Estado de cerradura (sensorId ${ws.sensorId}): ${data.estado}`);
            global.cerraduraEstado = { abierta: data.estado === 'abierta' };
          }

          // 🔹 Nuevo: Si el ESP envía logs, reenviarlos al frontend
          if (data.action === "LOG") {
            io.emit("esp_log", {
              sensorId: id,
              message: data.message,
              timestamp: Date.now()
            });
          }

          // 🔹 Nuevo: Si el ESP terminó el enrolamiento
          else if (data.action === "ENROLL_RESULT") {
            const id = ws.sensorId || 'desconocido';
            io.emit("esp_enroll_result", {
              sensorId: id,
              success: data.success,
              fingerId: data.fingerId || null
            });
          }

        } catch (e) {
          console.error('Error procesando mensaje del ESP:', e);
        }
      });

      ws.on('close', () => {
        console.log('ESP32 desconectado');
        io.emit("esp_log", { sensorId: id, message: "🔴 ESP32 desconectado", timestamp: Date.now() });
        if (ws.sensorId) {
          espClients.delete(ws.sensorId);
          console.log(`ESP con sensorId ${id} eliminado del mapa`);
        }
      });

      // Respuesta inicial (opcional)
      ws.send('Conectado al backend');
    });

    return wss;
  },

  getWSS: () => {
    if (!wss) throw new Error("WebSocket para ESP no inicializado");
    return wss;
  },

  // Obtener un ESP específico por sensorId
  getESP: (sensorId) => {
    return espClients.get(sensorId);
  }
};
