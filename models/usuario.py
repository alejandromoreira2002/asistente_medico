from db.db import db

class UsuarioModelo():
    def __init__(self):
        self.db = db()

    def loginUsuario(self, usuario):
        sql = f"SELECT * FROM usuarios WHERE usuario='{usuario}' AND rol='admin'";
        datos = self.db.consultarDato(sql)
        return datos