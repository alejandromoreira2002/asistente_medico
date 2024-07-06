from models.pacientes import PacienteModelo

class PacientesControlador():
    def __init__(self):
        self.modelo = PacienteModelo()

    def getPaciente(self, cedula):
        paciente = self.modelo.getPaciente(cedula)

        if(paciente):
            return {
                "code": 1,
                "datos": {
                    "id": paciente['id'],
                    "nombres": paciente['nombres'],
                    "apellidos": paciente['apellidos'],
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
            return {"res": 1, "mensaje": "Los datos fueron agregados con exito"}
        else:
            return {"res": 0, "mensaje": "No se pudo realizar la insercion"}