from models.asistente import AsistenteModelo

class AsistenteControlador():
    def __init__(self):
        self.modelo = AsistenteModelo()
    
    def getSintomas(self, corpus):
        sintomas = self.modelo.getSintomas(corpus)
        return {
            "sintomas": str(sintomas.replace('síntomas: ', ''))
        }
    
    def getRespuesta(self, mensaje):
        respuesta = self.modelo.getRespuesta(mensaje)
        return {
            "mensaje": respuesta
        }