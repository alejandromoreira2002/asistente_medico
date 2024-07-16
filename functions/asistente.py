def getFuncionesAsistente():
    sintomas = {
        "type": "function",
        "function":{
            "name": "get_sintomas",
            "description": "Extrae los sintomas a detalle que estoy presentando actualmente, omite los sintomas a detalle que ya no presento y los sintomas a detalle que no corresponden a mi genero",
            "parameters": {
                "type": "object",
                "properties": {
                    "sintomas": {
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma1', 'sintoma2', 'sintoma3', ...]
                        "description": "Sintomas que estoy experimentando actualmente"
                    },
                    "excluidos":{
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma_excluido1', 'sintoma_excluido2', 'sintoma_excluido3', ...]
                        "description": "Sintomas que ya no estoy experimentando"
                    },
                    "nuevos":{
                        "type": "array",
                        "items": {"type": "string"}, #['nuevo_sintoma1', 'nuevo_sintoma2', 'nuevo_sintoma3', ...]
                        "description": "Sintomas nuevos que estoy experimentando"
                    },
                    "sfromgenero":{
                        "type": "array",
                        "items": {"type": "string"}, #['gen_sintoma1', 'gen_sintoma2', 'gen_sintoma3', ...]
                       "description": "Sintomas que no corresponden a mi genero"
                    }
                },
                "required": ["sintomas", "excluidos", "nuevos" "sfromgenero"]
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
        "content": "Eres un asistente medico y te encuentras operativo en el dispensario médico de la Universidad Técnica de Manabí, te preocupas por la salud del paciente en turno y para poder ayudarle necesitas saber todos los sintomas que está presentando. Si el paciente ha experimentado anteriormente otros tipos de sintomas, comenzaras preguntandole si los sigue presentando actualmente, cuando termines de hablar de ello con el paciente, le preguntaras si tiene nuevos sintomas actualmente. Si el paciente no te da mucha información, le preguntaras mas detalle sobre cada uno de los sintomas que presenta. Es importante que descartes sintomas que no tienen nada que ver con el genero del paciente." # 
    }]