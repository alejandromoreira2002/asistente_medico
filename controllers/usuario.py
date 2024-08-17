from models.usuario import UsuarioModelo
import bcrypt

class UsuarioControlador():
    def __init__(self):
        self.modelo = UsuarioModelo()

    def loginUsuario(self, parametros):
        usuario = self.modelo.loginUsuario(parametros['username'])
        print(usuario)
        r = {}
        if usuario:
            validado = self.validarPassword(parametros['password'], usuario['contrasena'])
            r = {
                'res': 1 if validado else 0,
                'id': usuario['id'] if validado else None
            }
        else:
            r = {
                'res': 0,
                'id': None
            }
        return r
            
    
    def validarPassword(self, password, hashed):
        return bcrypt.checkpw(str.encode(password), str.encode(hashed))
