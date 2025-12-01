from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# Conexão com MongoDB Atlas
client = MongoClient("mongodb+srv://JoaoMarcos5:O4cchFDRqZcAfFVA@cluster0.n9ze7e0.mongodb.net/")
db = client["redap"]
colecao = db["sensores"]  # coleção sem vírgulas

# Receber dados da ESP32
@app.route("/enviar", methods=["POST"])
def receber():
    data = request.json
    if not data:
        return jsonify({"status": "erro", "mensagem": "JSON vazio"}), 400

    colecao.update_one({"id": data["id"]}, {"$set": data}, upsert=True)
    return jsonify({"status": "ok", "mensagem": "Dados salvos no MongoDB!"})

# Retornar sensores para o front
@app.route("/sensores")
def listar_sensores():
    sensores = []
    for s in colecao.find({}, {'_id': 0}):
        nivel = s.get("nivelAgua", 0)
        status = (
            "Normal" if nivel < 10 else
            "Alerta" if nivel < 20 else
            "Risco" if nivel < 30 else
            "Crítico"
        )
        sensores.append({
            "id": s.get("id"),
            "nome": s.get("nome"),
            "lat": s.get("lat"),
            "lng": s.get("lng"),
            "bairro": s.get("bairro"),
            "nivelAgua": nivel,
            "temperatura": s.get("temperatura", 0),
            "umidade": s.get("umidade", 0),
            "status": status
        })
    return jsonify(sensores)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
