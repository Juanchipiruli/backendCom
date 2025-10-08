#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include <ESP32Servo.h>
#include <WebSocketsClient.h>

// WiFi
const char* ssid = "UTN_LIBRE_2.4G";
const char* password = "12345678";
const String serverURL = "http://192.168.237.231:3000/api";
const String wsServerURL = "192.168.237.231";
const int wsPort = 3000;
const int sensorId = 1;
bool abierto = false;

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

// Variables de WebSocket
bool wsConectado = false;

void setup() {
  Serial.begin(115200);
  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  pinMode(SENSOR_MAGNETICO, INPUT_PULLUP);  // HIGH = cerrado, LOW = abierto
  cerradura.attach(SERVO_PIN, 500, 2400);
  cerradura.write(0);  // Inicialmente cerrado

  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");

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
  unsigned long ahora = millis();

  // Mantener conexión WebSocket
  webSocket.loop();

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
}

uint8_t getFinger() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) return p;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return p;

  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    int id = finger.fingerID;
    Serial.print("Huella detectada con ID: ");
    Serial.println(id);
    manejarAcceso(id);
  } else {
    Serial.println("Huella no encontrada.");
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
    cerrarCerradura();
    HTTPClient http;
    String url = String(serverURL) + "/aulas/close=" + String(sensorId);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.PATCH("{}");
    Serial.print("Código de respuesta del servidor: ");
    Serial.println(httpCode);

    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("Respuesta del backend:");
      Serial.println(response);
    }

    http.end();
  }
}

void abrirCerradura() {
  cerradura.write(90);  // Abrir
  Serial.println("Cerradura abierta");
  abierto = true;
  
  // Notificar estado por WebSocket si está conectado
  if (wsConectado) {
    enviarEstadoCerradura("abierta");
  }
}

void cerrarCerradura() {
  cerradura.write(0);  // Cerrar
  Serial.println("Cerradura cerrada");
  abierto = false;
  
  // Notificar estado por WebSocket si está conectado
  if (wsConectado) {
    enviarEstadoCerradura("cerrada");
  }
}

void checkDoor() {
  int estadoActual = digitalRead(SENSOR_MAGNETICO);

  if (estadoActual != ultimoEstadoMagnetico) {
    ultimoEstadoMagnetico = estadoActual;

    if (estadoActual == LOW) {
      Serial.println("Puerta abierta detectada");
      enviarEstadoPuerta("abierta");
    } else {
      Serial.println("Puerta cerrada detectada");
      enviarEstadoPuerta("cerrada");
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

  int httpCode = http.POST(payload);
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
      
    case WStype_CONNECTED:
      Serial.println("WebSocket conectado");
      wsConectado = true;
      break;
      
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
}

// Función para enviar estado de la cerradura por WebSocket
void enviarEstadoCerradura(String estado) {
  if (wsConectado) {
    String respuesta = "{\"estado\":\"" + estado + "\"}";
    webSocket.sendTXT(respuesta);
    Serial.println("Estado enviado: " + respuesta);
  }
}
