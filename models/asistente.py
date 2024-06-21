from openai import OpenAI
import os

class AsistenteModelo():
    def __init__(self):
        self.client = OpenAI(
            api_key=os.environ.get("API_GPT")
        )
        self.sistema = [
            {
                "role": "system",
                "content": """
                    Eres un asistente medico que se preocupa por 
                    la salud de tu paciente y para ayudarlo necesitas saber todos 
                    los síntomas que él presenta.
                    Tu tarea es preguntarle al paciente 
                    sobre sus sintomas, si crees que su respuesta no te basta le puedes 
                    seguir preguntando por otros síntomas hasta que creas que tienes 
                    los síntomas suficientes.
                    Puedes preguntarle mas por cada uno de los sintomas que el paciente te haya mencionado.
                    Cuando el paciente diga ya no tenga mas sintomas que mencionarte, deberas
                    finalizar la conversacion sin preguntar si necesita algo más.
                    Cuando termines de reconocer todos los síntomas que él te ha mencionado,
                    los devolverás en formato JSON con 3 keys: 'sintomas' teniendo como value los
                    sintomas del paciente, 'mensaje' teniendo como value cualquier mensaje de conversacion
                    con el paciente y la key 'comando' con el value 'finalizar' cuando te despidas.
                """
            }
        ]

    def getRespuesta(self, mensaje):
        mensajes = self.sistema + mensaje
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={ "type": "json_object" },
            messages=mensajes
        )
        respuesta_modelo = response.choices[0].message.content
        return respuesta_modelo

    def getSintomas(self, corpus):
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
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