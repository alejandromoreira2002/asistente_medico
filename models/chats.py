from db.db import db

class ChatModelo():
    
    def __init__(self):
        self.db = db()

    def verificarCodigo(self, codigo):
        sql = f"SELECT * FROM Chats_Historial WHERE codigo = '{codigo}'"
        datos = self.db.consultarDato(sql)

        if datos:
            return datos
        else:
            return None
    
    def insertarChat(self, chat, codigo, cedula, fecha):
        sql = "INSERT INTO Chats_Historial(codigo, paciente, conversacion, fecha) VALUES(%s,%s,%s,%s)"
        parametros = (codigo, cedula, chat, fecha)
        resultado = self.db.insertarDatos(sql, parametros)
        print("RESULTADO DE INSERCION: ", resultado)
        return resultado
    
    def actualizarChat(self, codigo, chat):
        sql = f'UPDATE Chats_Historial SET conversacion = %s WHERE codigo = %s'
        parametros = (chat, codigo)
        resultado = self.db.actualizarDatos(sql, parametros)
        return resultado