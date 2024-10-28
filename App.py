from flask import Flask, render_template, url_for, redirect, request, session, jsonify, send_from_directory
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from controllers.pacientes import PacientesControlador
from controllers.asistente import AsistenteControlador
from controllers.formulario import FormularioControlador
from controllers.chats import ChatControlador
from controllers.usuario import UsuarioControlador
#from functions.functions import encriptar
from functions.functions import generarCodigoAleatorio
from functions.asistente import getMensajeSistema
from datetime import timedelta
import logging
import json
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv(os.path.join(os.getcwd(), '.env'))

# Guardara todos los ChatCompletions de respuesta a las funciones del asistente
# Esto evita que el asistente vuelva a repetir el envio de la funcion
compMsgs = []

v_asistente3D = int(os.getenv('ACCESO_DIRECTO'))
URLInicial = os.getenv('URL_DEV') or ''
isDev = (URLInicial != '')
#isDev = 0
#URLInicial = '/~dev' if isDev else ''

#print("URL Inicial: " + URLInicial);

app = Flask(__name__)
app.config['SECRET_KEY'] = b'_5#y2L"F4Q8z\n\xec]/'
app.config["JWT_SECRET_KEY"] = b'_5#y2L"F4Q8z\n\xec]/'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['JWT_TOKEN_LOCATION'] = ['headers']

# Inicializacion del JWT
jwt = JWTManager(app)

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
    if(request.path == f'{URLInicial}/'):
        logger.info(f"Solicitud entrante desde: {request.remote_addr}")
        logger.info(f"Ruta requerida: {request.path}")

# Manejador del error 404
@app.errorhandler(404)
def page_not_found(e):
    # Renderiza una plantilla para el error 404
    return render_template('404.html', esDev=isDev), 404

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('static', filename)

@app.get(f'{URLInicial}/')
def Index():
    if v_asistente3D:
        return redirect(url_for('asistente3D'))
    else:
        return redirect(url_for('asistente2D'))

@app.get(f'{URLInicial}/asistente')
def asistente2D():
    return render_template('index.html')

@app.get(f'{URLInicial}/asistente/3d')
def asistente3D():
    asistente = request.args.get('genero')
    if asistente and (asistente=='masculino' or asistente=='femenino' or asistente=='no'):
        return render_template('3d.html', asistente={'genero':asistente}, isDev=isDev)
    else:
        return render_template('asistentes.html', isDev=isDev)


@app.get(f'{URLInicial}/asistente/voces')
def vocesAsistente():
    return render_template('voces.html')

@app.get('/avatar')
def modeloAvatar():
    asistente = request.args.get('genero')
    return render_template('avatar.html', asistente={'genero':asistente})

@app.get(f'{URLInicial}/pacientes')
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
    if 'admin' in session:
        return redirect(url_for('dashboardAdmin'))
    else:
        return render_template('admin/login.html')

@app.post('/admin/login')
def loginPostAdmin():
    username = request.form['usuario']
    password = request.form['password']
    parametros = {'username': username, 'password': password}

    controlador = UsuarioControlador()
    usuario = controlador.loginUsuario(parametros)
    
    #print(usuario)
    if usuario['res'] == 1:
        access_token = create_access_token(identity=usuario['id'])
        session['admin'] = usuario['id']
        return jsonify({'code': 1, 'message': 'Login Success', 'access_token': access_token})
    else:
        return jsonify({'code': 0, 'message': 'Login Failed'}), 401

dashboardRoute = '/admin/dashboard'

@app.get(dashboardRoute)
def dashboardAdmin():
    if 'admin' in session:
        return render_template('admin/dashboard.html')
    else:
        #session.pop('admin')
        return redirect(url_for('loginAdmin'))

@app.get(dashboardRoute + '/home')
@jwt_required()
def adminHome():
    user_id = get_jwt_identity()
    if user_id:
        datos = {'mensaje': "Bienvenido a la pantalla de administracion."}
        return render_template('admin/fragmento.html', datos=datos)

'''@app.post('/api/admin/config')
@jwt_required()
def changeOnAdminConfig():
    user_id = get_jwt_identity()
    if user_id:
        respuesta = {'res': 0, 'msg': 'No se pudo cambiar el modo de deploy.'}

        try:
            global isDev
            global URLInicial

            isDev = request.form['deploy_mode']
            URLInicial = '/~dev' if isDev else ''

            respuesta = {'res': 1, 'msg': 'Se pudo cambiar correctamente el modo de deploy. Por favor, reinicie el servidor para aplicar los cambios'}
        except:
            print(respuesta)

        return jsonify(respuesta)'''

@app.get('/api/admin/pacientes')
@jwt_required()
def getPacientes():
    user_id = get_jwt_identity()
    if user_id:
        controlador = PacientesControlador()
        pacientes = controlador.getPacientes()
        return jsonify(pacientes)
    
@app.get('/api/admin/chats')
@jwt_required()
def getChats():
    user_id = get_jwt_identity()
    if user_id:
        controlador = ChatControlador()
        chats = controlador.getChats()
        return jsonify(chats)
        
@app.get('/admin/logout')
def adminLogout():
    if 'admin' in session:
        session.pop('admin')
        return jsonify({'res': 1, 'contenido': 'Se deslogueo correctamente'})
    else:
        return jsonify({'res': 0, 'contenido': 'No hay sesion'})
    
@app.get(dashboardRoute + '/chats')
def consultaChat():
    return render_template('admin/chats.html')

@app.get(dashboardRoute + '/chat')
@jwt_required()
def consultaContenidoChat():
    user_id = get_jwt_identity()
    if user_id:
        codigo = request.args.get('cod')
        controlador = ChatControlador()
        chat = controlador.getContenidoChat(codigo)
        if(chat['res'] == 1):
            paciente = PacientesControlador().getPaciente(chat['datos']['paciente'])
            chat['datos']['paciente'] = f"{paciente['datos']['nombres']} {paciente['datos']['apellidos']}"
        #chat['datos'] = json.dumps(chat['datos'])
        #print(json.dumps(chat['datos']))
        #print(chat)
        return jsonify(chat)

@app.post('/paciente')
def getPaciente():
    global compMsgs
    cedula = request.form['cedula']
    fecha = request.form['fecha']
    #print("CODIGOOOOOOOOOO")
    #print(request.form['codfuncs'].split(','))
    codfuncs = request.form['codfuncs'].split(',') if request.form['codfuncs'] else ['1']
    controlador = PacientesControlador()
    paciente = controlador.getPaciente(cedula)
    if paciente['code'] == 1:
        historialControl = ChatControlador()
        codigo = ''
        existeCodigo = 1
        while(existeCodigo):
            codigo = generarCodigoAleatorio(5)
            existeCodigo = historialControl.verificarCodigo(codigo)
        #print(codigo)
        session['codigo'] = codigo
        session['user'] = cedula
        session['codfuncs'] = codfuncs
        tmpMensaje = getMensajeSistema(codfuncs)
        session['mensajes'] = tmpMensaje
        historialControl.insertarChat(tmpMensaje, codigo, cedula, fecha)
        compMsgs = list(filter(lambda x: x['paciente'] != cedula, compMsgs))
        #print(compMsgs)
    return jsonify(paciente)

@app.get('/prueba/paciente')
def getPruebaPaciente():
    controlador = PacientesControlador()
    paciente = controlador.getPaciente('1316307618')
    #print(paciente)
    return jsonify({'paciente': paciente})

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
    controlador = AsistenteControlador(session['codfuncs'])
    respuesta = controlador.getRespuesta(session.get('user'), mTmpAsis, compMsgs, genero)
    almacenar_msg = respuesta['almacenar_msg']
    if respuesta['mensaje']:
        nuevoCM = {"paciente": session.get('user'), "lastId": len(almacenar_msg), "data": respuesta['mensaje']}
        compMsgs.append(nuevoCM)
        almacenar_msg.append(str(respuesta['mensaje']))
    else:
        almacenar_msg.append({'role': 'assistant', 'content': respuesta['respuesta_msg']})
    
    historialControl = ChatControlador()
    #print(almacenar_msg)
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
        'codfuncs': session['codfuncs'],
        #'sintomas': request.form['sintomas'],
        'cod_chat': session['codigo']
    }

    if '1' in session['codfuncs']:
        parametros['sintomas'] = request.form['sintomas']
    if '2' in session['codfuncs']:
        parametros['diagnostico'] = request.form['diagnostico']
    if '3' in session['codfuncs']:
        parametros['tratamiento'] = request.form['tratamiento']
    
    controlador = FormularioControlador()
    return jsonify(controlador.guardarFormulario(parametros))

if __name__ == '__main__':
    app.run(port=3000, debug=True)