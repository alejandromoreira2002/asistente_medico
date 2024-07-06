def getFuncionesAsistente():
    sintomas = {
        "type": "function",
        "function":{
            "name": "get_sintomas",
            "description": "Obtiene los sintomas de la conversacion",
            "parameters": {
                "type": "object",
                "properties": {
                    "sintomas": {
                        "type": "array",
                        "items": {"type": "string"} #['sintoma1', 'sintoma2', 'sintoma3']
                    }
                },
                "required": ["sintomas"]
            }
        }
    }

    finalizar = {
        "type": "function",
        "function":{
            "name": "finalizar",
            "description": "Detecta cuando el usuario finaliza la conversacion",
            "parameters": {
                "type": "object",
                "properties": {
                    "respuesta": {
                        "type": "boolean",
                        "description": "Envia True cuando finalice la conversacion"
                    }
                },
                "required": ["respuesta"]
            }
        }
    }

    return [sintomas, finalizar]

def getMensajeSistema():
    return [{
        "role": "system",
        "content": "Eres un asistente medico y te encuentras operativo en el área de triage en una clínica, te preocupas por la salud del paciente en turno y para poder ayudarle necesitas saber todos los sintomas que está presentando. Si el paciente ha experimentado anteriormente otros tipos de sintomas, comenzaras preguntandole si los sigue presentando actualmente, cuando termines de hablar de ello con el paciente, le preguntaras si tiene nuevos sintomas actualmente. Si el paciente no te da mucha información, le preguntaras mas detalle sobre cada uno de los sintomas que presenta."
    }]