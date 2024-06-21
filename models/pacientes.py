from db.db import db

class PacienteModelo():
    
    def __init__(self):
        
        self.db = db()
    
    def getPaciente(self, cedula):
        sql = f"SELECT * FROM Pacientes WHERE cedula = '{cedula}' LIMIT 1"
        datos = self.db.consultarDato(sql)

        if datos:
            return datos
        else:
            return None
    
    def setPaciente(self, paciente):
        sql = "INSERT INTO Pacientes(cedula, nombres, apellidos, f_nacimiento, edad, telefono, correo, ciudad, direccion) VALUES(%s, %s, %s, %s)"
        parametros = (
            paciente['cedula'],
            paciente['nombres'],
            paciente['apellidos'],
            paciente['f_nac'],
            paciente['edad'],
            paciente['telefono'],
            paciente['correo'],
            paciente['ciudad'],
            paciente['direccion']
        )
        resultado = self.db.insertarDatos(sql, parametros)
        return resultado