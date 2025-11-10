/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include <ESP32Servo.h>
#include <WebSocketsClient.h>
#include <ArduinoOTA.h>

Librerias que se usaron

*/

// WiFi
const String ssid = "Juan Galaxy S23U";
const String password = "12345678";
const String serverIP = "10.42.74.109";
const int wsPort = 8081;
const int sensorId = 1;
bool abierto = true;

// Armar URLs
String serverURL = "http://" + String(serverIP) + ":3000/api";
String wsServerURL = String(serverIP);

// Pines
#define SENSOR_MAGNETICO 4   // Reed switch
#define SERVO_PIN 18         // Servo motor

// Componentes
HardwareSerial mySerial(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
Servo cerradura;
WebSocketsClient webSocket;

// Variables de control de tiempo
unsigned long ultimoChequeoHuella = 0;
unsigned long ultimoChequeoPuerta = 0;
unsigned long ultimoReconexionWS = 0;

// Estado previo del sensor magnético
int ultimoEstadoMagnetico = HIGH;
int modo;
bool enProcesoEnroll = false;
bool enrollRequest = false;

// Variables de WebSocket
bool wsConectado = false;

/*void leerCredenciales() {
  Serial.println("Ingrese SSID:");
  while (Serial.available() == 0) {}
  String ssidInput = Serial.readStringUntil('\n');
  ssidInput.trim();
  ssidInput.toCharArray(ssid, sizeof(ssid));

  Serial.println("Ingrese contraseña:");
  while (Serial.available() == 0) {}
  String passInput = Serial.readStringUntil('\n');
  passInput.trim();
  passInput.toCharArray(password, sizeof(password));

  Serial.println("Ingrese IP del servidor (ej: 192.168.0.100):");
  while (Serial.available() == 0) {}
  String ipInput = Serial.readStringUntil('\n');
  ipInput.trim();
  ipInput.toCharArray(serverIP, sizeof(serverIP));

  

  Serial.println("\n📡 Configuración ingresada:");
  Serial.print("SSID: "); Serial.println(ssid);
  Serial.print("Servidor: "); Serial.println(serverIP);
  Serial.println("Intentando conectar al WiFi...");
}
*/

void setup() {
  Serial.begin(115200);
  modo = 0;
  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  cerradura.attach(SERVO_PIN, 500, 2400);
  cerradura.write(180);
  delay(9000);
  cerradura.write(90);  // Inicialmente cerrado
  abierto= true;
  pinMode(SENSOR_MAGNETICO, INPUT_PULLUP);  // HIGH = cerrado, LOW = abierto


  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");

  // --- Configuración OTA ---
  ArduinoOTA.setHostname("esp32-cerradura");  // nombre visible en la red
  ArduinoOTA.setPassword("1234");             // contraseña opcional (recomendado)

  ArduinoOTA.onStart([]() {
    Serial.println("Inicio de actualización OTA...");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nActualización completada!");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progreso: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error OTA [%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Error de autenticación");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Error al comenzar");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Error de conexión");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Error al recibir");
    else if (error == OTA_END_ERROR) Serial.println("Error al finalizar");
  });

  ArduinoOTA.begin();
  Serial.println("OTA listo. Esperando actualizaciones...");

  if (finger.verifyPassword()) {
    Serial.println("Sensor OK");
  } else {
    Serial.println("Sensor no detectado");
    while (1);
  }

  // Configurar WebSocket
  webSocket.begin(wsServerURL.c_str(), wsPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  ArduinoOTA.handle();
  webSocket.loop();

  unsigned long ahora = millis();

  // Reconectar WebSocket si es necesario
  if (!wsConectado && ahora - ultimoReconexionWS > 10000) {
    Serial.println("Intentando reconectar WebSocket...");
    webSocket.begin(wsServerURL.c_str(), wsPort, "/");
    ultimoReconexionWS = ahora;
  }

  // Verificar huella cada 200 ms
  if (ahora - ultimoChequeoHuella > 200) {
    getFinger();
    ultimoChequeoHuella = ahora;
  }

  // Verificar sensor magnético cada 200 ms
  if (ahora - ultimoChequeoPuerta > 200) {
    checkDoor();
    ultimoChequeoPuerta = ahora;
  }
  
  if (enrollRequest && !enProcesoEnroll) {
    enrollRequest = false;  // limpiar bandera
    enProcesoEnroll = true;
    modo = 1;               // activar modo enroll
    Serial.println("[DEBUG] Iniciando ENROLL desde loop()");
    modoEnrollAuto();
    enProcesoEnroll = false;
    modo = 0;
    delay(5000);
  } 
}

uint8_t getFinger() {
  uint8_t p = finger.getImage();
  if (p == FINGERPRINT_NOFINGER) return p;  // nada que hacer
  if (p != FINGERPRINT_OK) return p;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return p;

  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    int id = finger.fingerID;
    Serial.print("Huella detectada con ID: ");
    Serial.println(id);
    manejarAcceso(id);
  } else if (p != FINGERPRINT_NOTFOUND) {
    Serial.println("Error leyendo huella.");
  }
  return p;
}

void manejarAcceso(int id) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi no conectado");
    return;
  }

  if (!abierto) {
    HTTPClient http;
    String url = String(serverURL) + "/validate/sensor=" + String(sensorId);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"ShuellaId\":\"" + String(id) + "\"}";

    int httpCode = http.POST(payload);
    Serial.print("Código de respuesta del servidor: ");
    Serial.println(httpCode);

    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("Respuesta del backend:");
      Serial.println(response);

      abrirCerradura();
    } else {
      Serial.println("Error en la solicitud POST");
    }

    http.end();
  } else {
    HTTPClient http;
    String url = String(serverURL) + "/aulas/close=" + String(sensorId);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"ShuellaId\":\"" + String(id) + "\"}";

    int httpCode = http.PATCH(payload);
    Serial.print("Código de respuesta del servidor: ");
    Serial.println(httpCode);

    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("Respuesta del backend:");
      Serial.println(response);
      cerrarCerradura();
    }else{
      String response = http.getString();
      Serial.println("Respuesta del backend:");
      Serial.println(response);
    }

    http.end();
  }
}

void abrirCerradura() {
  if(!abierto){
  cerradura.write(180);  // Abrir
  delay(9000);
  cerradura.write(90);
  Serial.println("Cerradura abierta");
  abierto = true;
  
  // Notificar estado por WebSocket si está conectado
  if (wsConectado) {
    enviarEstadoCerradura("abierta");
  }
}
}

void cerrarCerradura() {
  if(abierto){
  cerradura.write(0);  // Cerrar
  delay(9000);
  cerradura.write(90);
  Serial.println("Cerradura cerrada");
  abierto = false;
  
  // Notificar estado por WebSocket si está conectado
  if (wsConectado) {
    enviarEstadoCerradura("cerrada");
  }
}
}

void checkDoor() {
  int estadoActual = digitalRead(SENSOR_MAGNETICO);

  if (estadoActual != ultimoEstadoMagnetico) {
    ultimoEstadoMagnetico = estadoActual;

    if (estadoActual == LOW) {
      Serial.println("Puerta cerrada detectada");
      enviarEstadoPuerta("cerrada");
    } else {
      Serial.println("Puerta abierta detectada");
      enviarEstadoPuerta("abierta");
    }
  }
}

void enviarEstadoPuerta(String estado) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi no conectado");
    return;
  }

  HTTPClient http;
  String url = String(serverURL) + "/aulas/update=" + String(sensorId);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"doorState\":\"" + estado + "\"}";

  int httpCode = http.PUT(payload);
  Serial.print("Código de respuesta del estado: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Respuesta del backend:");
    Serial.println(response);
  } else {
    Serial.println("Error al enviar estado de puerta");
  }

  http.end();
}

// Función para manejar eventos de WebSocket
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket desconectado");
      wsConectado = false;
      break;
      
    case WStype_CONNECTED: {
    Serial.println("WebSocket conectado");
    wsConectado = true;

    // Enviar identificación al backend
    String registro = "{\"sensorId\": " + String(sensorId) + "}";
    webSocket.sendTXT(registro);

    // 🔹 Enviar estado inicial de la cerradura
    String estado = abierto ? "\"abierta\"" : "\"cerrada\"";
    String lockMsg = "{\"action\":\"LOCK_STATE\",\"lockStateAbierto\":" +  estado + "}";

    webSocket.sendTXT(lockMsg);
    Serial.println("Estado LOCK_STATE enviado: " + lockMsg);

    break;
    }
      
    case WStype_TEXT:
      String mensaje = String((char*)payload);
      Serial.println("Mensaje recibido: " + mensaje);
      procesarComandoWebSocket(mensaje);
      break;
  }
}

// Función para procesar comandos del WebSocket
void procesarComandoWebSocket(String comando) {
  if (comando == "OPEN") {
    Serial.println("Comando OPEN recibido");
    abrirCerradura();
    // Notificar al backend que se abrió
    enviarEstadoCerradura("abierta");
  }
  else if (comando == "CLOSE") {
    Serial.println("Comando CLOSE recibido");
    cerrarCerradura();
    // Notificar al backend que se cerró
    enviarEstadoCerradura("cerrada");
  }
  else if (comando == "STATUS") {
    Serial.println("Comando STATUS recibido");
    enviarEstadoCerradura(abierto ? "abierta" : "cerrada");
  }
  else if (comando == "DOORSTATUS") {
    Serial.println("Comando DOORSTATUS recibido");
    enviarEstadoPuerta();
    
  }else if (comando == "ENROLL") {
    Serial.println("Comando ENROLL recibido");
    enrollRequest = true; 
    Serial.println("[DEBUG] enrollRequest marcada en true");
  }
}

// Función para enviar estado de la cerradura por WebSocket
void enviarEstadoCerradura(String estado) {
  if (wsConectado) {
    String respuesta = "{\"estado\":\"" + estado + "\"}";
    webSocket.sendTXT(respuesta);
    Serial.println("Estado enviado: " + respuesta);
  }
}

void enviarEstadoPuerta() {
  String estado = "";
  if(wsConectado) {
      if (ultimoEstadoMagnetico == LOW) {
        Serial.println("Puerta cerrada detectada");
        estado = "cerrada";
      } else {
        Serial.println("Puerta abierta detectada");
        estado = "abierta";
      }
    }
    String respuesta = "{\"estadoPuerta\":\"" + estado + "\"}";
    webSocket.sendTXT(respuesta);
    Serial.println("Estado enviado: " + respuesta);
  }

void modoEnrollAuto() {
  enviarLog("Iniciando modo ENROLL automático...");
  Serial.println("Enroll auto iniciado");

  finger.getTemplateCount();
  int nuevoID = finger.templateCount + 1;

  if (nuevoID > 127) {
    enviarLog("Límite máximo de huellas alcanzado.");
    Serial.println("Límite máximo de huellas alcanzado.");
    return;
  }

  enviarLog("ID asignado automáticamente: " + String(nuevoID));
  Serial.println("ID asignado automáticamente: " + String(nuevoID));

  if (enrollFinger(nuevoID)) {
    enviarLog("Huella registrada correctamente con ID " + String(nuevoID));
    Serial.println("Huella registrada correctamente con ID " + String(nuevoID));

    // Enviar resultado al backend
    String msg = "{\"action\":\"ENROLL_RESULT\",\"success\":true,\"fingerId\":" + String(nuevoID) + "}";
    webSocket.sendTXT(msg);
  } else {
    enviarLog("❌ Falló el registro de huella.");
    Serial.println("Fallo el  registro");
    String msg = "{\"action\":\"ENROLL_RESULT\",\"success\":false}";
    webSocket.sendTXT(msg);
  }
  modo= 0;
}

bool enrollFinger(int id) {
  int p = -1;
  enviarLog("Coloque el dedo en el sensor...");

  while ((p = finger.getImage()) != FINGERPRINT_OK){
    webSocket.loop();
    delay(10);
  };

  if (finger.image2Tz(1) != FINGERPRINT_OK) return false;
  enviarLog("Retire el dedo...");
  delay(2000);

  p = 0;
  while (p != FINGERPRINT_NOFINGER) p = finger.getImage();

  enviarLog("Coloque el mismo dedo nuevamente...");
  while ((p = finger.getImage()) != FINGERPRINT_OK);

  if (finger.image2Tz(2) != FINGERPRINT_OK) return false;
  if (finger.createModel() != FINGERPRINT_OK) return false;
  if (finger.storeModel(id) == FINGERPRINT_OK) {
    enviarLog("Huella almacenada correctamente!");
    return true;
  }

  return false;
}

void enviarLog(String mensaje) {
  Serial.println("[LOG] " + mensaje); // Mostrar en Serial

  // Enviar al backend por WebSocket
  if (wsConectado) {
    String json = "{\"action\":\"LOG\",\"message\":\"" + mensaje + "\"}";
    webSocket.sendTXT(json);
  }
}