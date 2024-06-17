from models.pacientes import PacienteModelo

class PacientesControlador():
    def __init__(self):
        self.modeloPaciente = PacienteModelo()

    def getPaciente(self, cedula):
        paciente = self.modeloPaciente.getPaciente(cedula)

        if(paciente):
            return {
                "code": 1,
                "datos": {
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