from db.db import db

class ChatModelo():
    
    def __init__(self):
        self.db = db()

    def verificarCodigo(self, codigo):
        sql = f"SELECT * FROM chats_historial WHERE codigo = '{codigo}'"
        datos = self.db.consultarDato(sql)

        if datos:
            return datos
        else:
            return None
        
    def getChats(self):
        sql = f"SELECT id, codigo, paciente, fecha, JSON_LENGTH(conversacion) AS mensajes FROM chats_historial"
        datos = self.db.consultarDatos(sql)

        if datos:
            return datos
        else:
            return None
        
    def getContenidoChat(self, codigo):
        sql = f"SELECT conversacion FROM chats_historial WHERE codigo = '{codigo}'"
        datos = self.db.consultarDatos(sql)

        if datos:
            return datos
        else:
            return None
    
    def insertarChat(self, chat, codigo, cedula, fecha):
        sql = "INSERT INTO chats_historial(codigo, paciente, conversacion, fecha) VALUES(%s,%s,%s,%s)"
        parametros = (codigo, cedula, chat, fecha)
        resultado = self.db.insertarDatos(sql, parametros)
        #print("RESULTADO DE INSERCION: ", resultado)
        return resultado
    
    def actualizarChat(self, codigo, chat):
        sql = f'UPDATE chats_historial SET conversacion = %s WHERE codigo = %s'
        parametros = (chat, codigo)
        resultado = self.db.actualizarDatos(sql, parametros)
        return resultado