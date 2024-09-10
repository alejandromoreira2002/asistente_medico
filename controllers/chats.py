from models.chats import ChatModelo
import json

class ChatControlador():
    def __init__(self):
        self.modelo = ChatModelo()

    def verificarCodigo(self, codigo):
        chats = self.modelo.verificarCodigo(codigo)

        if chats and len(chats) > 0:
            return 1
        else:
            return 0
    
    def getChats(self):
        datos = self.modelo.getChats()
        if datos and len(datos) > 0:
            return {
                "res": 1,
                "datos": datos
            }
        else:
            return {
                "res": 0,
                "datos": "No existen datos."
            }
    
    def getContenidoChat(self, codigo):
        dato = self.modelo.getContenidoChat(codigo)
        if dato and len(dato) > 0:
            return {
                "res": 1,
                "datos": {
                    'paciente': dato['paciente'],
                    'conversacion': json.dumps(dato['conversacion'])
                }
            }
        else:
            return {
                "res": 0,
                "datos": "No existen datos."
            }

    def insertarChat(self, chat, codigo, cedula, fecha):
        chat_json = json.dumps(chat)
        self.modelo.insertarChat(chat_json, codigo, cedula, fecha)

    def actualizarChat(self, codigo, chat):
        chat_json = json.dumps(chat)
        self.modelo.actualizarChat(codigo, chat_json)
