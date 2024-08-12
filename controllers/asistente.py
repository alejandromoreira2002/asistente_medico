from models.asistente import AsistenteModelo
from flask import session
import json

class AsistenteControlador():
    def __init__(self, codFuncs):
        self.modelo = AsistenteModelo(codFuncs)
    
    def getSintomas(self, corpus):
        sintomas = self.modelo.getSintomas(corpus)
        return {
            "sintomas": str(sintomas.replace('síntomas: ', ''))
        }
    
    def getRespuesta(self, paciente, mensajes, compMsgs, genero):
        respuesta = self.modelo.getRespuesta(paciente, mensajes, compMsgs)
        respuesta_msg = respuesta['respuesta_msg']
        funciones = respuesta['asis_funciones']

        #print(mensajes)
        mensajes = list(map(lambda c: str(c) if not type(c) is dict else c, mensajes))
        #print(mensajes)

        if funciones:
            obj_funciones = [];
            for funcion in funciones:
                argumentos = json.loads(funcion.function.arguments)
                #json_args = json.loads(argumentos)
                #print(argumentos)
                if(funcion.function.name == 'get_sintomas'):
                    nFiltrados = self.modelo.filtrarSintomasxGenero(argumentos, genero)
                    resnfilt = json.loads(nFiltrados)
                    argumentos['nuevos'] = resnfilt['otros'] if 'otros' in resnfilt else []
                    argumentos['sfromgenero'] = resnfilt['degenero'] if 'degenero' in resnfilt else []
                obj_funciones.append(
                    {
                        "funcion_id": funcion.id,
                        "funcion_name": funcion.function.name,
                        "funcion_args": argumentos,
                    }
                )
            return {
                "almacenar_msg": mensajes,
                "mensaje": respuesta['respuesta'],
                "respuesta_msg": respuesta_msg,
                "asis_funciones": obj_funciones
            }
        else:
            return {
                "almacenar_msg": mensajes,
                "mensaje": None,
                "respuesta_msg": respuesta_msg,
                "asis_funciones": None
            }