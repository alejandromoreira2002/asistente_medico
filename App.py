from flask import Flask, render_template, url_for, redirect, request, session, jsonify
from controllers.pacientes import PacientesControlador
from controllers.asistente import AsistenteControlador
from controllers.formulario import FormularioControlador
#from functions.functions import encriptar
from functions.asistente import getMensajeSistema
import logging
import json

compMsgs = []

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
with app.test_request_context():
    url_for('static', filename='/img/')
    url_for('static', filename='/css/style.css')
    url_for('static', filename='/css/loading.css')
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

@app.get('/prueba')
def getFormulario():
    return render_template('prueba.html')

@app.post('/paciente')
def getPaciente():
    global compMsgs
    cedula = request.form['cedula']
    controlador = PacientesControlador()
    paciente = controlador.getPaciente(cedula)
    if paciente['code'] == 1:
        session['user'] = cedula
        session['mensajes'] = getMensajeSistema()
        compMsgs = list(filter(lambda x: x['paciente'] != cedula, compMsgs))
        print(compMsgs)
    return jsonify(paciente)

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
    cedula = request.form['cedula']
    controlador = FormularioControlador()
    return jsonify(controlador.consultarSintomas(cedula))

indice = 0
@app.post('/conversar')
def getRespuesta():
    global compMsgs

    genero = request.form['genero']
    mensaje = request.form['mensaje']
    mensajeList = json.loads(mensaje)

    mensTemp = session.get('mensajes')
    for melist in mensajeList:
        mensTemp.append(melist)
    
    mTmpAsis = list(mensTemp)
    controlador = AsistenteControlador()
    respuesta = controlador.getRespuesta(session.get('user'), mTmpAsis, compMsgs, genero)
    if respuesta['mensaje']:
        nuevoCM = {"paciente": session.get('user'), "lastId": len(mTmpAsis), "data": respuesta['mensaje']}
        compMsgs.append(nuevoCM)

    session['mensajes'] = mensTemp
    return jsonify({"respuesta_msg": respuesta['respuesta_msg'], "asis_funciones": respuesta['asis_funciones']})

@app.post('/form/guardar')
def guardarFormulario():
    parametros = {
        'idPaciente': request.form['idPaciente'],
        'codFormulario': request.form['codFormulario'],
        'fechaAtencion': request.form['fechaAtencion'],
        'cedula': request.form['cedula'],
        'peso': request.form['peso'],
        'estatura': request.form['estatura'],
        'presionSistolica': request.form['presionSistolica'],
        'presionDistolica': request.form['presionDistolica'],
        'frecuenciaCardiaca': request.form['frecuenciaCardiaca'],
        'temperatura': request.form['temperatura'],
        'sintomas': request.form['sintomas']
    }
    
    controlador = FormularioControlador()
    return jsonify(controlador.guardarFormulario(parametros))

@app.get('/detenerAsistente')
def stopAsistente():
    return jsonify({"code": 1})

if __name__ == '__main__':
    app.run(port=3000, debug=True)