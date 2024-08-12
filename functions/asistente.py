def getFuncionesAsistente(codFuncs):
    sintomas = {
        "type": "function",
        "function":{
            "name": "get_sintomas",
            "description": "Extrae los sintomas a detalle que estoy presentando actualmente, omite los sintomas que ya no presento y los que no corresponden a mi genero",
            "parameters": {
                "type": "object",
                "properties": {
                    "sintomas": {
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma1', 'sintoma2', 'sintoma3', ...]
                        "description": "Sintomas a detalle que estoy experimentando actualmente"
                    },
                    "excluidos":{
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma_excluido1', 'sintoma_excluido2', 'sintoma_excluido3', ...]
                        "description": "Sintomas a detalle que ya no estoy experimentando"
                    },
                    "nuevos":{
                        "type": "array",
                        "items": {"type": "string"}, #['nuevo_sintoma1', 'nuevo_sintoma2', 'nuevo_sintoma3', ...]
                        "description": "Sintomas nuevos a detalle que estoy experimentando"
                    }
                },
                "required": ["sintomas", "excluidos", "nuevos"]
            }
        }
    }

    diagnostico = {
        "type": "function",
        "function":{
            "name": "get_diagnostico",
            "description": "En base a los sintomas de la conversación devuelveme los posibles diagnosticos del paciente",
            "parameters": {
                "type": "object",
                "properties": {
                    "diagnosticos": {
                        "type": "array",
                        "items": {"type": "string"}, #['sintoma1', 'sintoma2', 'sintoma3', ...]
                        "description": "Posibles diagnosticos del paciente"
                    }
                },
                "required": ["diagnosticos"]
            }
        }
    }

    tratamiento = {
        "type": "function",
        "function":{
            "name": "get_tratamiento",
            "description": "Devuelveme el tratamiento que debe seguir el paciente",
            "parameters": {
                "type": "object",
                "properties": {
                    "tratamiento":{
                        "type": "string",
                        "description": "tratamiento del paciente"
                    }
                },
                "required": ["tratamiento"]
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

    guardado = {
        "type": "function",
        "function":{
            "name": "guardar_form",
            "description": "Detecta cuando el usuario desea guardar el formulario",
            "parameters": {
                "type": "object",
                "properties": {
                    "respuesta": {
                        "type": "boolean",
                        "description": "Envia True cuando guarde el formulario"
                    }
                },
                "required": ["respuesta"]
            }
        }
    }
    
    funciones = []

    if '1' in codFuncs:
        funciones.append(sintomas)
    if '2' in codFuncs:
        funciones.append(diagnostico)
    if '3' in codFuncs:
        funciones.append(tratamiento)
    
    funciones += [finalizar, guardado]

    return funciones

def getMensajeSistema(codFuncs):
    contenidoSistema = "Eres un asistente medico y te encuentras operativo en el dispensario médico de la Universidad Técnica de Manabí, te preocupas por la salud del paciente en turno y para poder ayudarle necesitas saber todos los sintomas que está presentando. Si el paciente ha experimentado anteriormente otros tipos de sintomas, comenzaras preguntandole si los sigue presentando actualmente, cuando termines de hablar de ello con el paciente, le preguntaras si tiene nuevos sintomas actualmente. Si el paciente no te da mucha información, le preguntaras mas detalle sobre cada uno de los sintomas que presenta. Evita programar una cita para el paciente"
    if codFuncs == ['1']:
        contenidoSistema += " No menciones un diagnostico ni le recomiendes algun tratamiento al paciente."
    else:
        if '2' in codFuncs:
            contenidoSistema += " Luego de reconocer todos sus sintomas, le daras al menos tres posibles diagnosticos al paciente."
        if '3' in codFuncs:
            adicional = " y sus posibles diagnosticos" if '2' in codFuncs else ""
            contenidoSistema += " Luego de reconocer todos sus sintomas" + adicional + ", le recomendaras seguir un tratamiento al paciente."

    return [{
        "role": "system",
        "content": contenidoSistema
    }]