from openai import OpenAI
import os

client = OpenAI(api_key=os.environ.get('API_GPT'))
nombre = "Teddy Alejandro"

# Lista para almacenar el historial de la conversación
historial_conversacion = [
    {"role": "system",
    "content": """
        Eres un asistente medico que se preocupa por 
        la salud de tu paciente y para ayudarlo necesitas saber todos 
        los síntomas que él presenta. Tu tarea es preguntarle al paciente 
        sobre sus sintomas, si crees que su respuesta no te basta le puedes 
        seguir preguntando por otros síntomas hasta que creas que tienes 
        los síntomas suficientes. Cuando termines de reconocer todos los 
        síntomas que él te ha mencionado, los devolverás dentro de corchetes y 
        cada uno separado por coma.
    """
    },
    # Debe dar un resumen solo de la parte de los síntomas para poder guardarlo como síntomas
    # El asistente debe dar una orden por si el paciente quiere terminar la ejecucion
]

# Función para enviar mensajes al modelo y recibir respuestas
def enviar_mensaje_conversacion(mensajes, nuevo_mensaje):
    mensajes.append({"role": "user", "content": nuevo_mensaje})
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=mensajes
    )
    respuesta_modelo = response.choices[0].message.content
    mensajes.append({"role": "assistant", "content": respuesta_modelo})
    global historial_conversacion
    historial_conversacion = mensajes
    return respuesta_modelo

print("Asistente: ", enviar_mensaje_conversacion(historial_conversacion, f"Dale una bienvenida al usuario que vas a atender, el se llama {nombre}"))
# Ejemplo de conversación continua
while True:
    mensaje_usuario = input("Tú: ")
    if mensaje_usuario.lower() in ['salir', 'adiós']:
        print("Asistente: ¡Hasta luego!")
        break
    respuesta_asistente = enviar_mensaje_conversacion(historial_conversacion, mensaje_usuario)
    print("Asistente:", respuesta_asistente)
#print(response.choices[0].message.content)

"""[
            {"role": "system",
            "content": 
                Eres un asistente medico que se preocupa por 
                la salud de tu paciente y para ayudarlo necesitas saber todos 
                los síntomas que él presenta. Tu tarea es preguntarle al paciente 
                sobre sus sintomas, si crees que su respuesta no te basta le puedes 
                seguir preguntando por otros síntomas hasta que creas que tienes 
                los síntomas suficientes. Cuando termines de reconocer todos los 
                síntomas que él te ha mencionado, los devolverás dentro de llaves y 
                cada uno separado por coma.
            },
            
            #{"role": "user", "content": f"Dale una bienvenida al usuario que vas a atender, el se llama {nombre}"},
            #{"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
            #{"role": "user", "content": "Where was it played?"}
        ]"""