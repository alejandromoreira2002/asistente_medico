from flask import Flask, render_template, url_for, redirect, request, session, jsonify
from controllers.pacientes import PacientesControlador
from controllers.asistente import AsistenteControlador
import logging
import json

app = Flask(__name__)
indice = 0;
with app.test_request_context():
    url_for('static', filename='/css/style.css')
    url_for('static', filename='/scripts/script.js')

# Configurar el registro
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Middleware para capturar solicitudes entrantes
@app.before_request
def log_request_info():
    if(request.path == '/'):
        logger.info(f"Solicitud entrante desde: {request.remote_addr}")
        logger.info(f"Ruta requerida: {request.path}")

@app.get('/')
def Index():
    return render_template('index.html')

@app.get('/formulario')
def getFormulario():
    return render_template('formulario.html')

@app.post('/paciente')
def getPaciente():
    cedula = request.form['cedula']
    controlador = PacientesControlador()
    return jsonify(controlador.getPaciente(cedula))

@app.post('/sintomas')
def getSintomas():
    corpus = request.form['corpus']
    controlador = AsistenteControlador()
    return jsonify(controlador.getSintomas(corpus))

@app.post('/conversar')
def getRespuesta():
    mensaje = request.form['mensaje']
    mensajeList = json.loads(mensaje)
    controlador = AsistenteControlador()
    return jsonify(controlador.getRespuesta(mensajeList))

@app.get('/detenerAsistente')
def stopAsistente():
    return jsonify({"code": 1})

if __name__ == '__main__':
    app.run(port=3000, debug=True)