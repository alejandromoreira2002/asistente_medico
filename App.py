from flask import Flask, render_template, url_for, redirect, request, session, jsonify, send_from_directory
from controllers.pacientes import PacientesControlador
from controllers.asistente import AsistenteControlador
from controllers.formulario import FormularioControlador
from controllers.chats import ChatControlador
#from functions.functions import encriptar
from functions.functions import generarCodigoAleatorio
from functions.asistente import getMensajeSistema
import logging
import json

# Guardara todos los ChatCompletions de respuesta a las funciones del asistente
# Esto evita que el asistente vuelva a repetir el envio de la funcion
compMsgs = []

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
with app.test_request_context():
    url_for('static', filename='/img/')
    url_for('static', filename='/Build/')
    url_for('static', filename='/TemplateData/')
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

@app.get('/asistente/3d')
def asistente3D():
    return render_template('3d.html')

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('static', filename)

@app.get('/pacientes')
def pacientesPage():
    return render_template('pacientes.html')

@app.get('/admin')
def indexAdmin():
    if 'admin' in session:
        return redirect(url_for('dashboardAdmin'))
    else:
        return redirect(url_for('loginAdmin'))


@app.get('/admin/login')
def loginAdmin():
    return render_template('admin/login.html')

@app.post('/admin/login')
def loginPostAdmin():
    usuario = request.form['usuario']
    password = request.form['password']
    respuesta = None
    return jsonify(respuesta)


@app.get('/admin/dashboard')
def dashboardAdmin():
    return render_template('admin/login.html')

@app.post('/paciente')
def getPaciente():
    global compMsgs
    cedula = request.form['cedula']
    fecha = request.form['fecha']
    controlador = PacientesControlador()
    paciente = controlador.getPaciente(cedula)
    if paciente['code'] == 1:
        historialControl = ChatControlador()
        codigo = ''
        existeCodigo = 1
        while(existeCodigo):
            codigo = generarCodigoAleatorio(5)
            existeCodigo = historialControl.verificarCodigo(codigo)
        print(codigo)
        session['codigo'] = codigo
        session['user'] = cedula
        tmpMensaje = getMensajeSistema()
        session['mensajes'] = tmpMensaje
        historialControl.insertarChat(tmpMensaje, codigo, cedula, fecha)
        compMsgs = list(filter(lambda x: x['paciente'] != cedula, compMsgs))
        print(compMsgs)
    return jsonify(paciente)

@app.post('/paciente/verificar')
def existePaciente():
    cedula = request.form['cedula']
    controlador = PacientesControlador()
    respuesta = controlador.verificarCedula(cedula)
    return jsonify(respuesta)

@app.post('/paciente/add')
def agregarPaciente():
    paciente = {
        "cedula": request.form['cedula'],
        "nombres": request.form['nombres'],
        "apellidos": request.form['apellidos'],
        "edad": request.form['edad'],
        "genero": request.form['genero'],
        "f_nacimiento": request.form['f_nacimiento'],
        "telefono": request.form['telefono'],
        "correo": request.form['correo'],
        "ciudad": request.form['ciudad'],
        "direccion": request.form['direccion']
    }

    controlador = PacientesControlador()
    return jsonify(controlador.setPaciente(paciente))

@app.post('/sintomas')
def getSintomas():
    cedula = request.form['cedula']
    controlador = FormularioControlador()
    return jsonify(controlador.consultarSintomas(cedula))

@app.get('/form/codigo')
def getCodigoForm():
    controlador = FormularioControlador()
    return jsonify(controlador.getCodigo())

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
    almacenar_msg = respuesta['almacenar_msg']
    if respuesta['mensaje']:
        nuevoCM = {"paciente": session.get('user'), "lastId": len(almacenar_msg), "data": respuesta['mensaje']}
        compMsgs.append(nuevoCM)
        almacenar_msg.append(str(respuesta['mensaje']))
    else:
        almacenar_msg.append({'role': 'assistant', 'content': respuesta['respuesta_msg']})
    
    historialControl = ChatControlador()
    print(almacenar_msg)
    historialControl.actualizarChat(session['codigo'], almacenar_msg)

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
        'sintomas': request.form['sintomas'],
        'cod_chat': session['codigo']
    }
    
    controlador = FormularioControlador()
    return jsonify(controlador.guardarFormulario(parametros))

@app.get('/detenerAsistente')
def stopAsistente():
    return jsonify({"code": 1})

if __name__ == '__main__':
    app.run(port=3000, debug=True)