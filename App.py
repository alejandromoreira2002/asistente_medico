from flask import Flask, render_template, url_for, redirect, request, session, jsonify
from controllers.pacientes import PacientesControlador
from controllers.asistente import AsistenteControlador
#from functions.functions import encriptar
import logging
import json

app = Flask(__name__)
with app.test_request_context():
    url_for('static', filename='/css/style.css')
    url_for('static', filename='/scripts/script.js')
    url_for('static', filename='/scripts/prueba.js')

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

@app.get('/prueba')
def getFormulario():
    return render_template('prueba.html')

@app.post('/paciente')
def getPaciente():
    cedula = request.form['cedula']
    controlador = PacientesControlador()
    return jsonify(controlador.getPaciente(cedula))

@app.post('/add/paciente')
def agregarPaciente():
    paciente = {
        "cedula": request.form['cedula'],
        "nombres": request.form['nombres'],
        "apellidos": request.form['apellidos'],
        "f_nac": request.form['f_nac'],
        "edad": request.form['edad'],
        "telefono": request.form['telefono'],
        "correo": request.form['correo'],
        "ciudad": request.form['ciudad'],
        "direccion": request.form['direccion']
    }

    controlador = PacientesControlador()
    jsonify(controlador.setPaciente(paciente))

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
    respuesta = controlador.getRespuesta(mensajeList)
    print(respuesta)
    return jsonify(respuesta)

@app.get('/detenerAsistente')
def stopAsistente():
    return jsonify({"code": 1})

if __name__ == '__main__':
    app.run(port=3000, debug=True)