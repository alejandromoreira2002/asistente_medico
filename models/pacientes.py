from db.db import db

class PacienteModelo():
    
    def __init__(self):
        
        self.db = db()
    
    def verificarCedula(self, cedula):
        sql = f"SELECT cedula FROM pacientes WHERE cedula = '{cedula}' LIMIT 1"
        datos = self.db.consultarDato(sql)
        if datos and len(datos) > 0:
            return 1
        else:
            return 0
    
    def getPacientes(self):
        sql = f"SELECT id, cedula, nombres, apellidos, f_nacimiento, edad, telefono, correo, ciudad, direccion, genero FROM pacientes"
        datos = self.db.consultarDatos(sql)

        if datos:
            return datos
        else:
            return None
    
    def getPaciente(self, cedula):
        sql = f"SELECT * FROM pacientes WHERE cedula = '{cedula}' LIMIT 1"
        datos = self.db.consultarDato(sql)

        if datos:
            return datos
        else:
            return None
    
    def setPaciente(self, paciente):
        sql = "INSERT INTO pacientes(cedula, genero, nombres, apellidos, f_nacimiento, edad, telefono, correo, ciudad, direccion) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        parametros = (
            paciente['cedula'],
            paciente['genero'],
            paciente['nombres'],
            paciente['apellidos'],
            paciente['f_nacimiento'],
            paciente['edad'],
            paciente['telefono'],
            paciente['correo'],
            paciente['ciudad'],
            paciente['direccion']
        )
        resultado = self.db.insertarDatos(sql, parametros)
        return resultado