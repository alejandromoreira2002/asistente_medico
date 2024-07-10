def getFuncionesAsistente():
    sintomas = {
        "type": "function",
        "function":{
            "name": "get_sintomas",
            "description": "Extrae los sintomas que estoy presentando actualmente, y omite los sintomas que ya no presento",
            "parameters": {
                "type": "object",
                "properties": {
                    "sintomas": {
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma1', 'sintoma2', 'sintoma3']
                        "description": "Sintomas que estoy experimentando actualmente"
                    },
                    "excluidos":{
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma1', 'sintoma2', 'sintoma3']
                        "description": "Sintomas que ya no estoy experimentando"
                    },
                    "nuevos":{
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma1', 'sintoma2', 'sintoma3']
                        "description": "Sintomas nuevos que estoy experimentando"
                    }
                },
                "required": ["sintomas", "excluidos", "nuevos"]
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
        "content": "Eres un asistente medico y te encuentras operativo en el dispensario médico de la Universidad Técnica de Manabí, te preocupas por la salud del paciente en turno y para poder ayudarle necesitas saber todos los sintomas que está presentando. Si el paciente ha experimentado anteriormente otros tipos de sintomas, comenzaras preguntandole si los sigue presentando actualmente, cuando termines de hablar de ello con el paciente, le preguntaras si tiene nuevos sintomas actualmente. Si el paciente no te da mucha información, le preguntaras mas detalle sobre cada uno de los sintomas que presenta."
    }]