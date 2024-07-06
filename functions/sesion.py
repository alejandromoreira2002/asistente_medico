from functions.asistente import getMensajeSistema
from flask import session

def crearSesion(cedula):
    session['user'] = {}
    session['user']['cedula'] = cedula
    session['user']['mensajes'] = getMensajeSistema()

def existeSesion():
    return True if 'user' in session else False

def eliminarSesion():
    session.pop('user', None)

def obtenerMensajes():
    return session['user']['mensajes']

def agregarMensaje(mensajes:dict):
    session['user']['mensajes'].append(mensajes)

def obtenerTodoUsuario():
    return session['user']