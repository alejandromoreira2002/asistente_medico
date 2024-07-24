from models.pacientes import PacienteModelo

class PacientesControlador():
    def __init__(self):
        self.modelo = PacienteModelo()

    def verificarCedula(self, cedula):
        resultado = self.modelo.verificarCedula(cedula)
        respuesta = {}
        if resultado == 1:
            respuesta = {
                'res': 1,
                'contenido': "El paciente ya existe"
            }
        else:
            respuesta = {
                'res': 0,
                'contenido': "El paciente no existe"
            }
        return respuesta
    

    def getPaciente(self, cedula):
        paciente = self.modelo.getPaciente(cedula)

        if(paciente):
            return {
                "code": 1,
                "datos": {
                    "id": paciente['id'],
                    "nombres": paciente['nombres'],
                    "apellidos": paciente['apellidos'],
                    "genero": paciente['genero'],
                    "f_nacimiento": paciente['f_nacimiento'].strftime("%Y-%m-%d"),
                    "telefono": paciente['telefono'],
                    "correo": paciente['correo'],
                    "ciudad": paciente['ciudad'],
                    "direccion": paciente['direccion']
                }
            }
        else:
            return {
                "code": 0
            }
    
    def setPaciente(self, paciente):
        respuesta = self.modelo.setPaciente(paciente)
        if respuesta == 1:
            return {"res": 1, "mensaje": "Se registraron correctamente los datos del paciente."}
        else:
            return {"res": 0, "mensaje": "No se pudo registrar los datos del paciente."}