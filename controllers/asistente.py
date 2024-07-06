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
    
    def getRespuesta(self, mensajes):
        respuesta = self.modelo.getRespuesta(mensajes)
        respuesta_msg = respuesta['respuesta_msg']
        funciones = respuesta['asis_funciones']

        if funciones:
            obj_funciones = [];
            for funcion in funciones:
                obj_funciones.append(
                    {
                        "funcion_id": funcion.id,
                        "funcion_name": funcion.function.name,
                        "funcion_args": funcion.function.arguments,
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