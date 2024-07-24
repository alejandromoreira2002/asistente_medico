from models.formulario import FormularioModelo

class FormularioControlador():
    def __init__(self):
        self.modelo = FormularioModelo()
    
    def consultarSintomas(self, cedula):
        sintomas = self.modelo.consultarSintomas(cedula)
        if sintomas:
            return {
                'res': 1,
                'contenido': sintomas
            }
        else:
            return {
                'res': 0,
                'contenido': 'No se encontraron sintomas relacionados a ese número de cedula'
            }
    
    def getCodigo(self):
        codigo = self.modelo.getCodigo();
        return {
            'res': 1,
            'contenido': codigo
        };
    
    def guardarFormulario(self, parametros):
        res = self.modelo.grabarSintomas(parametros)
        if res['res'] == 1:
            parametros['idSintomas'] = res['id']
            res2 = self.modelo.grabarFormulario(parametros)
            return {
                'res': res2,
                'contenido': "El formulario ha sido guardado con éxito." if res2 else "No se pudo guardar el formulario."
            }
        else:
            return {
                'res': 0,
                'contenido': "Hubo un problema al guardar los sintomas. No se pudo guardar el formulario."
            }