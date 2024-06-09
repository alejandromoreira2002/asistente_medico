from openai import OpenAI
from functions.functions import getKeyAsistente

class AsistenteModelo():
    def __init__(self):
        self.client = OpenAI(
            api_key=getKeyAsistente('keys/asistente.txt')
        )

    def getSintomas(self, corpus):
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un asistente que extrae palabras relevantes de conversaciones"},
                {"role": "user", "content": f"Extrae los síntomas mencionados en la siguiente conversación y devuelvelos sin decir nada más: {corpus}"}
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

