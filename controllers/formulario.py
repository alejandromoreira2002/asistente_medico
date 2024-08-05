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
        actres = 1
        ultmsg = ''
        parametros['idSintomas'] = 1
        parametros['idDiagnostico'] = 1
        parametros['idTratamiento'] = 1
        if '1' in parametros['codfuncs'] and actres == 1:
            res = self.modelo.grabarSintomas(parametros)
            actres = res['res']
            ultmsg = res['msg']
            parametros['idSintomas'] = res['id'] if res['res']==1 else 1
            #print(parametros['idSintomas'])

        if '2' in parametros['codfuncs'] and actres == 1:
            res = self.modelo.grabarDiagnostico(parametros)
            actres = res['res']
            ultmsg = res['msg']
            parametros['idDiagnostico'] = res['id'] if res['res']==1 else 1
            #print(parametros['idDiagnostico'])

        if '3' in parametros['codfuncs'] and actres == 1:
            res = self.modelo.grabarTratamiento(parametros)
            actres = res['res']
            ultmsg = res['msg']
            parametros['idTratamiento'] = res['id'] if res['res']==1 else 1
            #print(parametros['idTratamiento'])

        #res = self.modelo.grabarSintomas(parametros)
        if actres == 1:
            #parametros['idSintomas'] = res['id']
            #print(parametros)
            res2 = self.modelo.grabarFormulario(parametros)
            return {
                'res': res2,
                'contenido': "El formulario ha sido guardado con éxito." if res2 else "No se pudo guardar el formulario."
            }
        else:
            return {
                'res': 0,
                'contenido': ultmsg + ". No se pudo guardar el formulario."
            }