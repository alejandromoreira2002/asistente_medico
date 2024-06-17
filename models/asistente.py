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
                    los síntomas que él presenta. Tu tarea es preguntarle al paciente 
                    sobre sus sintomas, si crees que su respuesta no te basta le puedes 
                    seguir preguntando por otros síntomas hasta que creas que tienes 
                    los síntomas suficientes. Cuando termines de reconocer todos los 
                    síntomas que él te ha mencionado, los devolverás dentro de llaves y 
                    cada uno separado por coma.
                """
            }
        ]

    def getRespuesta(self, mensaje):
        mensajes = self.sistema + mensaje
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=mensajes
        )
        respuesta_modelo = response.choices[0].message.content
        return respuesta_modelo

    def getBienvenida(self, paciente):
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """Eres un asistente medico que se preocupa por 
                        la salud de tu paciente y para ayudarlo necesitas saber todos 
                        los síntomas que él presenta. Tu tarea es preguntarle al paciente 
                        sobre sus sintomas, si crees que su respuesta no te basta le puedes 
                        seguir preguntando por otros síntomas hasta que creas que tienes 
                        los síntomas suficientes. Cuando termines de reconocer todos los 
                        síntomas que él te ha mencionado, los devolverás dentro de llaves y 
                        cada uno separado por coma."""
                },
                {
                    "role": "user",
                    "content": paciente
                }
            ]
        )
        return response.choices[0].message.content

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
texto = 
Doctor: ¿Cómo se siente hoy?
Paciente: Me siento un poco cansado y he tenido dolor de cabeza.
Doctor: ¿Ha notado algún otro síntoma?
Paciente: Sí, he estado tosiendo y me duele la garganta.
"""

"""
Pues hoy me levanté con dolor abdominal, siento que tengo algo de acidez ya que de momentos siento algo ácido subir por mi garganta y luego regresa al estomago, en la tarde he presentado leves nausias, y un pequeño dolor de cabeza, también solo por ratos. He tenido gases pero no tengo ganas de ir al baño.
"""