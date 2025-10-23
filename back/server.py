from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json
from datetime import datetime

app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Armazenamento em memória
sensor_data = {}  # {sensor_id: {"labels":[], "temp":[], "hum":[], "nivel":[]}}

# MQTT setup
MQTT_BROKER = "localhost"  # ou IP do broker
MQTT_PORT = 1883
MQTT_TOPIC = "sensors/#"

def on_connect(client, userdata, flags, rc):
    print("MQTT conectado")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())
    sensor_id = payload['id']
    now = datetime.now().strftime("%H:%M:%S")
    if sensor_id not in sensor_data:
        sensor_data[sensor_id] = {"labels": [], "temp": [], "hum": [], "nivel": []}
    hist = sensor_data[sensor_id]
    hist["labels"].append(now)
    hist["temp"].append(payload["temp"])
    hist["hum"].append(payload["hum"])
    hist["nivel"].append(payload["nivel"])
    # limitar histórico
    MAX_HISTORY = 50
    if len(hist["labels"]) > MAX_HISTORY:
        for key in hist: hist[key].pop(0)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

# Endpoints HTTP para frontend
@app.route('/api/sensors')
def get_sensors():
    return jsonify(sensor_data)

@app.route('/api/sensors/<sensor_id>')
def get_sensor(sensor_id):
    return jsonify(sensor_data.get(sensor_id, {}))

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
