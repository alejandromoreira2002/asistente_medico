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
    
