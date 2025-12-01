#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <DHT.h>

// ------------------------------
// CONFIGURAÇÕES
// ------------------------------
#define DHT_PIN 4
#define DHT_TYPE DHT11
#define TRIG_PIN 7
#define ECHO_PIN 8

DHT dht(DHT_PIN, DHT_TYPE);

String API_URL = "http://192.168.0.12:5000/enviar";
unsigned long lastSend = 0;
unsigned long intervalo = 10000; // 10 segundos

// Lista de paradas
struct Parada {
  int id;
  const char* nome;
  float lat;
  float lng;
  const char* bairro;
};

Parada paradas[] = {
  {1, "Parada Boa Viagem", -8.117, -34.894, "Boa Viagem"},
  {2, "Parada Derby", -8.052, -34.903, "Derby"},
  {3, "Parada Afogados", -8.085, -34.917, "Afogados"},
  {4, "Parada Santo Amaro", -8.058, -34.894, "Santo Amaro"},
  {5, "Parada Iputinga", -8.062, -34.925, "Iputinga"},
  {6, "Parada Cais do Porto", -8.060, -34.871, "Cais do Porto"},
  {7, "Parada Torre", -8.046, -34.894, "Torre"},
  {8, "Parada Casa Amarela", -8.025, -34.910, "Casa Amarela"},
  {9, "Parada Encruzilhada", -8.068, -34.895, "Encruzilhada"},
  {10, "Parada Piedade", -8.075, -34.905, "Piedade"},
  {11, "Parada Cordeiro", -8.093, -34.918, "Cordeiro"},
  {12, "Parada Madalena", -8.065, -34.908, "Madalena"},
  {14, "Parada Recife Antigo", -8.063, -34.880, "Recife Antigo"},
  {15, "Parada Boa Vista", -8.056, -34.893, "Boa Vista"}
};

int totalParadas = sizeof(paradas) / sizeof(paradas[0]);
int indiceAtual = 0; // vai controlar qual parada enviar

// ------------------------------
// FUNÇÃO PARA MEDIR DISTÂNCIA
// ------------------------------
float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracao = pulseIn(ECHO_PIN, HIGH, 30000);
  float distancia = duracao * 0.034 / 2;
  return distancia;
}

// ------------------------------
// FUNÇÃO PARA CALCULAR STATUS
// ------------------------------
String calcularStatus(float nivelAgua) {
  if (nivelAgua < 10) return "Normal";
  if (nivelAgua < 20) return "Alerta";
  if (nivelAgua < 30) return "Risco";
  return "Crítico";
}

// ------------------------------
// SETUP
// ------------------------------
void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  dht.begin();

  WiFiManager wm;
  wm.autoConnect("REDAP-SETUP");

  Serial.println("Conectado ao WiFi!");
  Serial.print("IP da ESP32: ");
  Serial.println(WiFi.localIP());

  WiFi.mode(WIFI_STA);
}

// ------------------------------
// LOOP
// ------------------------------
void loop() {
  if (millis() - lastSend >= intervalo) {

    // Seleciona a parada atual
    Parada p = paradas[indiceAtual];

    float temp = dht.readTemperature();
    float humi = dht.readHumidity();
    float dist = medirDistancia(); // nível de água

    if (isnan(temp) || isnan(humi)) {
      Serial.println("Erro ao ler DHT!");
      lastSend = millis();
      return;
    }

    String status = calcularStatus(dist);

    // Monta JSON
    String json = "{";
    json += "\"id\":" + String(p.id) + ",";
    json += "\"nome\":\"" + String(p.nome) + "\",";
    json += "\"lat\":" + String(p.lat, 6) + ",";
    json += "\"lng\":" + String(p.lng, 6) + ",";
    json += "\"bairro\":\"" + String(p.bairro) + "\",";
    json += "\"nivelAgua\":" + String(dist, 1) + ",";
    json += "\"temperatura\":" + String(temp, 1) + ",";
    json += "\"umidade\":" + String(humi, 1) + ",";
    json += "\"status\":\"" + status + "\"";
    json += "}";

    Serial.println("Enviando JSON: " + json);

    // Envio HTTP
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(json);

    if (httpCode > 0) {
      Serial.print("HTTP code: ");
      Serial.println(httpCode);
      Serial.print("Resposta da API: ");
      Serial.println(http.getString());
    } else {
      Serial.print("Erro ao enviar: ");
      Serial.println(httpCode);
    }
    http.end();

    lastSend = millis();

    // Passa para a próxima parada
    indiceAtual++;
    if (indiceAtual >= totalParadas) {
      indiceAtual = 0; // volta pro começo
    }
  }
}
