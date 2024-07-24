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
    
    def insertarChat(self, chat, codigo, cedula, fecha):
        chat_json = json.dumps(chat)
        self.modelo.insertarChat(chat_json, codigo, cedula, fecha)

    def actualizarChat(self, codigo, chat):
        chat_json = json.dumps(chat)
        self.modelo.actualizarChat(codigo, chat_json)
