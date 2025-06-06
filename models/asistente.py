from openai import OpenAI
from functions.asistente import getFuncionesAsistente
import os
import json

class AsistenteModelo():
    def __init__(self, codFuncs):
        self.client = OpenAI(
            api_key=os.environ.get("API_GPT")
        )
        #self.asistente = os.environ.get("ID_ASISTENTE")
        #self.hilo = None
        #self.run = None
        self.sistema = [
            {
                "role": "system",
                "content": "Eres un asistente medico y te encuentras operativo en el área de triage en una clínica, te preocupas por la salud del paciente en turno y para poder ayudarle necesitas saber todos los sintomas que está presentando. Si el paciente ha experimentado anteriormente otros tipos de sintomas, comenzaras preguntandole si los sigue presentando actualmente, cuando termines de hablar de ello con el paciente, le preguntaras si tiene nuevos sintomas actualmente. Si el paciente no te da mucha información, le preguntaras mas detalle sobre cada uno de los sintomas que presenta."
                #"content": "Eres un asistente medico y te encuentras operativo en el área de triage en una clínica, te preocupas por la salud del paciente en turno y para poder ayudarle necesitas saber todos los sintomas que está presentando. Tu trabajo será preguntarle al paciente sobre los síntomas que está experimentando actualmente y extraerlos. Si el paciente no te da mucha información, le preguntaras mas detalle sobre cada uno de los sintomas que presenta. Si el paciente presentó otros sintomas en alguna consulta anterior, le preguntaras sobre si esos síntomas persisten o no. Cuando termines de reconocer todos los síntomas que él te ha mencionado,  los devolverás en formato JSON con 3 keys: 'sintomas' teniendo como value los sintomas del paciente, 'mensaje' teniendo como value cualquier mensaje de conversacion con el paciente y la key 'comando' con el value 'finalizar' cuando te despidas."
                
            }
        ]
        self.funciones = getFuncionesAsistente(codFuncs)

    def getRespuesta(self, codigoSesion, paciente, mensajes, compMsgs):
        #mensaje = self.buscarToolCalls(mensaje)
        #mensajes = self.sistema + mensaje
        tMensajes = mensajes
        for cm in compMsgs:
            if cm and cm['paciente'] == paciente and cm['codigoSesion'] == codigoSesion: 
                tMensajes.insert(cm['lastId'], cm['data'])
        print(tMensajes)
        response = self.client.chat.completions.create(
            model="gpt-4o", #3.5-turbo
            #response_format={ "type": "json_object" },
            messages=tMensajes,
            tools=self.funciones,
            tool_choice="auto",
            max_tokens=512,
            temperature=1,
            top_p=1
        )
        respuesta = response.choices[0].message
        #print(response.choices[0])
        return {
            'respuesta': respuesta,
            'respuesta_msg': respuesta.content,
            'asis_funciones': respuesta.tool_calls
        }
    
    def filtrarSintomasxGenero(self, sintomas, genero):
        sint = sintomas['nuevos'] if sintomas['nuevos'] else sintomas['sintomas']
        response = self.client.chat.completions.create(
            model="gpt-4o",
            #response_format={ "type": "json_object" },
            response_format={ "type": "json_object" },
            messages=[
                {
                    "role": "system",
                    "content": f"Eres un asistente medico capaz de filtrar sintomas y devolverlos en formato JSON: guardaras los sintomas que no correspondan al genero {genero} como value de la key 'degenero' y el resto de sintomas los guardaras como valor de la key 'otros'."
                },
                {
                    "role": "user",
                    "content": f"Filtra los sintomas de la siguiente lista: {sint}"
                }
            ]
        )
        respuesta = response.choices[0].message.content
        #print(respuesta)
        return respuesta
    
    def getSintomas(self, corpus):
        response = self.client.chat.completions.create(
            model="gpt-4o", #3.5-turbo
            messages=[
                {
                    "role": "system",
                    "content": """Eres un asistente medico que extraes los sintomas de un corpus"""
                },
                {
                    "role": "user",
                    "content": f"Extrae los síntomas mencionados en la siguiente conversación y devuelvelos sin decir nada más: {corpus}"
                }
            ]
        )

        return response.choices[0].message.content
    
"""
de este modo:
                    Los sintomas encontrados seran el value de la key
                    'sintomas', cuando te despidas devolveras un 'finalizar' como value
                    de la key 'comando', y cualquier otro mensaje de conversacion con el paciente
                    seran el value de la key 'mensaje'. 


Eres un asistente medico que se preocupa por 
                    la salud de tu paciente y para ayudarlo necesitas saber todos 
                    los síntomas que él presenta.
                    Tu tarea es preguntarle al paciente 
                    sobre sus sintomas, si crees que su respuesta no te basta le puedes 
                    seguir preguntando por otros síntomas hasta que creas que tienes 
                    los síntomas suficientes.
                    Debes pedirle mas detalle de cada uno de los sintomas que el paciente te
                    mencione.
                    Cuando el paciente diga que no tiene mas sintomas que mencionar, tienes 
                    que agradecer, despedirte y si es necesario tambien le puedes proporcionar 
                    un comentario adicional.
                    Cuando termines de reconocer todos los síntomas que él te ha mencionado,
                    los devolverás en formato JSON con 3 keys: 'sintomas' teniendo como value los
                    sintomas del paciente, 'mensaje' teniendo como value cualquier mensaje de conversacion
                    con el paciente y la key 'comando' con el value 'finalizar' cuando te despidas.
texto = 
Doctor: ¿Cómo se siente hoy?
Paciente: Me siento un poco cansado y he tenido dolor de cabeza.
Doctor: ¿Ha notado algún otro síntoma?
Paciente: Sí, he estado tosiendo y me duele la garganta.
"""

"""
Pues hoy me levanté con dolor abdominal, siento que tengo algo de acidez ya que de momentos siento algo ácido subir por mi garganta y luego regresa al estomago, en la tarde he presentado leves nausias, y un pequeño dolor de cabeza, también solo por ratos. He tenido gases pero no tengo ganas de ir al baño.
"""