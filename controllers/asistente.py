from models.asistente import AsistenteModelo
from flask import session
import json

class AsistenteControlador():
    def __init__(self):
        self.modelo = AsistenteModelo()
    
    def getSintomas(self, corpus):
        sintomas = self.modelo.getSintomas(corpus)
        return {
            "sintomas": str(sintomas.replace('síntomas: ', ''))
        }
    
    def getRespuesta(self, paciente, mensajes, compMsgs, genero):
        respuesta = self.modelo.getRespuesta(paciente, mensajes, compMsgs)
        respuesta_msg = respuesta['respuesta_msg']
        funciones = respuesta['asis_funciones']

        if funciones:
            obj_funciones = [];
            for funcion in funciones:
                argumentos = json.loads(funcion.function.arguments)
                #json_args = json.loads(argumentos)
                print(argumentos)
                if(funcion.function.name == 'get_sintomas'):
                    nFiltrados = self.modelo.filtrarSintomasxGenero(argumentos, genero)
                    resnfilt = json.loads(nFiltrados)
                    argumentos['nuevos'] = resnfilt['otros']
                    argumentos['sfromgenero'] = resnfilt['degenero']
                obj_funciones.append(
                    {
                        "funcion_id": funcion.id,
                        "funcion_name": funcion.function.name,
                        "funcion_args": argumentos,
                    }
                )
            return {
                "mensaje": respuesta['respuesta'],
                "respuesta_msg": respuesta_msg,
                "asis_funciones": obj_funciones
            }
        else:
            return {
                "mensaje": None,
                "respuesta_msg": respuesta_msg,
                "asis_funciones": None
            }